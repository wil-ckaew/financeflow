import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinanceFlow",
  description: "Painel moderno para gestão financeira",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-white`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar fixa */}
          <Sidebar />
          {/* Conteúdo principal */}
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="p-6 bg-gray-50 dark:bg-gray-900 flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
