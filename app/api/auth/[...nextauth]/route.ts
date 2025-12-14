// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export default NextAuth(authOptions);
