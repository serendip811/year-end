import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import FCMHandler from "@/components/FCMHandler";
import FCMDebugger from "@/components/FCMDebugger";
import BottomNav from "@/components/BottomNav";
import QueryProvider from "@/components/QueryProvider";
import LoadingBar from "@/components/LoadingBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "카모 빌링비즈 마니또",
  description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
  manifest: "/manifest.json",
  metadataBase: new URL('https://year-end-green.vercel.app'),
  openGraph: {
    title: "카모 빌링비즈 마니또",
    description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
    type: "website",
    locale: "ko_KR",
    siteName: "카모 빌링비즈 마니또",
  },
  twitter: {
    card: "summary",
    title: "카모 빌링비즈 마니또",
    description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "카모 빌링비즈 마니또",
  },
  formatDetection: {
    telephone: false,
  },
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
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>
          <LoadingBar />
          <FCMHandler />
          <FCMDebugger />
          <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
            <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col">
              <div className="flex-1 pb-16 overflow-hidden">
                {children}
              </div>
              <BottomNav />
            </div>
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
