import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "MultiTenant Platform",
  description: "A multi-tenant platform with custom domains",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
