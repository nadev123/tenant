// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenants: true },
        });

        if (!user) return null;

        // ⚠️ Replace with bcrypt compare in production
        if (credentials.password !== user.password) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenants[0]?.id,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT & { userId?: string; tenantId?: string };
      user?: any;
    }) {
      if (user) {
        token.userId = user.id;
        token.tenantId = user.tenantId;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: any;
      token: JWT & { userId?: string; tenantId?: string };
    }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};
