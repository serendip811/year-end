import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import FCMHandler from "@/components/FCMHandler";
import FCMDebugger from "@/components/FCMDebugger";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manitto Secret Chat",
  description: "Anonymous chat for year-end party",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FCMHandler />
        <FCMDebugger />
        <div className="min-h-screen bg-gray-100 flex justify-center">
          <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
            <div className="flex-1 pb-16">
              {children}
            </div>
            <BottomNav />
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
