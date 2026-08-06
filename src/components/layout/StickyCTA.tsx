"use client";

import { useContactModal } from "@/components/project/ContactModalProvider";

// Dùng chung state mở modal với tab "Tư vấn" trong DetailTabsNav (xem ContactModalProvider) —
// không tự quản lý state/modal riêng để tránh 2 modal độc lập cùng lúc.
export function StickyCTA() {
  const { openContactModal } = useContactModal();

  return (
    <div className="sticky bottom-0 flex shrink-0 gap-2.5 border-t border-line bg-white p-3">
      <a
        href="tel:19001234"
        aria-label="Gọi tư vấn"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line text-[18px]"
      >
        ☎
      </a>
      <button
        type="button"
        onClick={openContactModal}
        className="flex flex-1 items-center justify-center rounded-xl bg-gold px-4 text-[14.5px] font-semibold text-ink"
      >
        Liên hệ tư vấn
      </button>
    </div>
  );
}
