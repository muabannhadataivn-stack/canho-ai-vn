"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Trang login chưa có phiên đăng nhập — không hiện nút Đăng xuất.
  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-3.5">
      <div className="flex items-center gap-5">
        <span className="font-display text-[15px] font-bold text-ink">canho.ai.vn — Quản trị</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/admin/du-an"
            className={`text-[13px] font-medium ${pathname.startsWith("/admin/du-an") ? "text-ink" : "text-graphite/50 hover:text-ink"}`}
          >
            Dự án
          </Link>
          <Link
            href="/admin/lien-he"
            className={`text-[13px] font-medium ${pathname.startsWith("/admin/lien-he") ? "text-ink" : "text-graphite/50 hover:text-ink"}`}
          >
            Liên hệ tư vấn
          </Link>
        </nav>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-graphite transition-colors hover:bg-paper-dim"
      >
        Đăng xuất
      </button>
    </header>
  );
}
