"use client";

export function StickyCTA({ projectName }: { projectName: string }) {
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
        onClick={() => {
          // Không có backend nhận lead trong phase này — mở form liên hệ, KHÔNG giả báo đã gửi.
          window.location.href = `/lien-he?du-an=${encodeURIComponent(projectName)}`;
        }}
        className="flex flex-1 items-center justify-center rounded-xl bg-gold px-4 text-[14.5px] font-semibold text-ink"
      >
        Liên hệ tư vấn
      </button>
    </div>
  );
}
