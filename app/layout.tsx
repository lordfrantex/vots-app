import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import App from "@/app/App";

import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Suspense } from "react";
import ProgressBar from "@/components/ui/progress-bar";

const interVariable = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vots",
  description: "A decentralized voting platform for tertiary institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interVariable.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <App>
            <Navbar />
            {children}
            <ToastProvider />
            <Footer />
          </App>
        </ThemeProvider>
      </body>
    </html>
  );
}
