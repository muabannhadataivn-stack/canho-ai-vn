"use client";

import { useContactModal } from "@/components/project/ContactModalProvider";

const SMS_PHONE = "0523888868";

// sms:{số}?body={nội dung} — cú pháp ?body= tương thích cả Android lẫn iOS (Safari/Messages
// hỗ trợ ? từ iOS 8 trở lên, tức từ lâu trước thời điểm hiện tại), nên không cần detect
// user agent riêng cho iOS dùng "&" — dùng thống nhất "?" là đủ phổ biến, tránh rủi ro
// hydration mismatch nếu tính href khác nhau giữa server/client.
function buildSmsHref(projectName: string): string {
  const body = encodeURIComponent(`Canho.ai.vn | Tôi cần tư vấn _ ${projectName}`);
  return `sms:${SMS_PHONE}?body=${body}`;
}

// SVG line-art tự vẽ, cùng convention với icon tiện ích lân cận (AmenitiesSection.tsx) —
// viewBox 0 0 20 20, stroke="currentColor", strokeWidth 1.6, không dùng emoji. Bong bóng
// chat + đuôi, thay cho ống nghe điện thoại cũ (hành vi nút đã đổi từ gọi sang gửi SMS).
function MessageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="14" height="10" rx="3" />
      <path d="M7 14l-1.5 3L9 14" />
    </svg>
  );
}

// Dùng chung state mở modal với tab "Tư vấn" trong DetailTabsNav (xem ContactModalProvider) —
// không tự quản lý state/modal riêng để tránh 2 modal độc lập cùng lúc.
export function StickyCTA() {
  const { openContactModal, projectName } = useContactModal();

  return (
    <div className="sticky bottom-0 flex shrink-0 gap-2.5 border-t border-line bg-white p-3">
      <a
        href={buildSmsHref(projectName)}
        aria-label="Nhắn tin tư vấn"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line text-ink"
      >
        <MessageIcon />
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
