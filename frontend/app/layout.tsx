import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar/navbar";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import "./globals.css";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "E-commerce Store",
  description: "Modern e-commerce platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className={cn("min-h-screen flex flex-col", raleway.className)}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster position="bottom-right" />
        <Footer />
      </body>
    </html>
  );
}
