import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn",
  description: "Practice coding with AI-generated problems and live code execution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  <body className="antialiased bg-background text-foreground overflow-auto">
        {children}
      </body>
    </html>
  );
}
