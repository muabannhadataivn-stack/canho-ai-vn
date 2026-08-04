"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export function NoBackendForm({
  children,
  submitLabel,
}: {
  children: ReactNode;
  submitLabel: string;
}) {
  const [attempted, setAttempted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // CHƯA có backend nhận dữ liệu trong phase này — không giả báo "đã gửi thành công".
    setAttempted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {children}
      <button type="submit" className="rounded-xl bg-gold py-3 text-[14px] font-semibold text-ink">
        {submitLabel}
      </button>
      {attempted && (
        <p className="rounded-xl border border-blueprint/30 bg-blueprint/5 p-3 text-[12.5px] leading-relaxed text-ink/70">
          Biểu mẫu này chưa được kết nối tới hệ thống tiếp nhận — nội dung bạn nhập chưa được gửi đi đâu cả.
          Trong giai đoạn hiện tại của canho.ai.vn, vui lòng liên hệ trực tiếp qua trang{" "}
          <a href="/lien-he" className="font-semibold text-blueprint underline">
            Liên hệ
          </a>{" "}
          để được hỗ trợ.
        </p>
      )}
    </form>
  );
}
