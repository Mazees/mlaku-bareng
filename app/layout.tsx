import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MLAKUBARENG — Kas Anggota Transparan",
  description: "Aplikasi kas keluarga transparan berbasis web",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="excel"
      className={`${inter.variable} h-full antialiased`}
    >
      <body
        className={`${inter.className} min-h-full flex flex-col bg-base-100 text-base-content`}
      >
        {children}
      </body>
    </html>
  );
}
