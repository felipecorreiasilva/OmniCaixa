import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniCaixa - Sistema de Gestão de PDV",
  description: "Sistema de gestão de ponto de venda (PDV) para lojas e comércios, desenvolvido com Next.js, React, TypeScript e Tailwind CSS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black`}
    >
      <body className="bg-black min-h-full flex flex-col">
        
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
