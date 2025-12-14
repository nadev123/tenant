// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenants: true },
        });

        if (!user) return null;

        // Simple password check, replace with hash comparison
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
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
};
