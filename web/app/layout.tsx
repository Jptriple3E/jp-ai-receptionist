import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eboh Emmanuel Emeke — Website Designer & Developer",
  description:
    "Modern SaaS business websites by Eboh Emmanuel Emeke.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
