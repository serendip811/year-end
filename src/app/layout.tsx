import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/QueryProvider";
import LoadingBar from "@/components/LoadingBar";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "카모 빌링비즈 마니또",
  description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
  manifest: "/manifest.json",
  metadataBase: new URL('https://year-end-green.vercel.app'),
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "카모 빌링비즈 마니또",
    description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
    type: "website",
    locale: "ko_KR",
    siteName: "카모 빌링비즈 마니또",
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: '카모 빌링비즈 마니또',
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "카모 빌링비즈 마니또",
    description: "카모 빌링비즈 연말 마니또 익명 채팅 앱",
    images: ['/icons/icon-512.png'],
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
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
