import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị canho.ai.vn" },
  robots: { index: false, follow: false },
};

// Khu vực admin dùng layout desktop bình thường — KHÔNG bọc AppShell/BottomNav
// (khung điện thoại của trang công khai, xem src/app/(public)/layout.tsx).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-dim">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
