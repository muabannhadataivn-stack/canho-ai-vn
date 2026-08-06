"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/admin-actions";

interface AdminProjectRowProps {
  id: string;
  name: string;
  province: string;
  provinceSlug: string;
  slug: string;
  publicationStatus: string;
  updatedAt: string;
}

const HIDE_DELAY_MS = 1200;

// Toàn bộ hàng là 1 client component (không chỉ riêng nút Xoá) để có thể ẩn dòng ngay
// (optimistic UI) sau khi xoá thành công — không đợi router.refresh() (round-trip mạng +
// render lại cả trang) mới cập nhật, tránh cảm giác "chưa xoá được" khiến bấm lại lần 2.
export function AdminProjectRow({ id, name, province, provinceSlug, slug, publicationStatus, updatedAt }: AdminProjectRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "hidden">("idle");

  async function handleDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Xoá vĩnh viễn dự án "${name}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setStatus("deleting");

    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteProject(formData);

    if (!result.ok) {
      setStatus("idle");
      window.alert(result.error ?? "Có lỗi khi xoá, thử lại.");
      return;
    }

    setStatus("deleted");
    router.refresh(); // chạy nền — đồng bộ lại tổng số dự án/phân trang cho lần load sau
    setTimeout(() => setStatus("hidden"), HIDE_DELAY_MS);
  }

  if (status === "hidden") return null;

  return (
    <tr className={`border-t border-line hover:bg-paper-dim ${status === "deleting" ? "opacity-50" : ""}`}>
      <td className="p-0">
        <Link href={`/admin/du-an/${id}`} className="block px-4 py-2.5 font-medium text-ink">
          {name}
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/admin/du-an/${id}`} className="block px-4 py-2.5 text-graphite">
          {province}
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/admin/du-an/${id}`} className="block px-4 py-2.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
              publicationStatus === "published" ? "bg-green/15 text-green" : "bg-gold/15 text-gold-dark"
            }`}
          >
            {publicationStatus === "published" ? "Đã publish" : "Draft"}
          </span>
        </Link>
      </td>
      <td className="p-0">
        <Link href={`/admin/du-an/${id}`} className="block px-4 py-2.5 text-graphite/70">
          {updatedAt}
        </Link>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          {publicationStatus === "published" && (
            <a
              href={`/can-ho/${provinceSlug}/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink hover:bg-paper-dim"
            >
              Xem
            </a>
          )}
          {status === "deleted" ? (
            <span className="text-[12.5px] font-medium text-green">Đã xoá ✓</span>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              disabled={status === "deleting"}
              className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-red hover:bg-red/5 disabled:opacity-60"
            >
              {status === "deleting" ? "Đang xoá..." : "Xoá"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
