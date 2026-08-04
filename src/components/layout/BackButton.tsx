"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Quay lại"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-paper"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
