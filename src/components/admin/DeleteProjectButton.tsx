"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/admin-actions";

// Client component nhỏ, tách riêng khỏi trang danh sách (server component) — chỉ đảm
// nhiệm đúng nút Xoá + confirm() bắt buộc, không có đường nào gọi deleteProject mà
// bỏ qua xác nhận (window.confirm chặn trước mọi lần gọi action).
export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Xoá vĩnh viễn dự án "${name}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("id", id);
    const result = await deleteProject(formData);
    setLoading(false);

    if (!result.ok) {
      window.alert(result.error ?? "Có lỗi khi xoá, thử lại.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-red hover:bg-red/5 disabled:opacity-60"
    >
      {loading ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
