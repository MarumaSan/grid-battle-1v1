import type { Metadata } from "next";
import { Inter, Anuphan } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });

export const metadata: Metadata = {
  title: "Grid Battle 1v1",
  description: "เกมวางแผนพิชิตตาราง 1 ต่อ 1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${anuphan.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
