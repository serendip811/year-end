import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 페이지 - 카모 빌링비즈 마니또",
  description: "마니또 메시지 통계 관리자 페이지",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

