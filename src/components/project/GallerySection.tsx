"use client";

import { useState } from "react";
import { SpecBlock } from "./SpecBlock";
import type { ProjectWithTier } from "@/lib/types";

// Carousel trượt ngang (CSS scroll-snap, không thêm dependency) + lightbox phóng to toàn màn
// hình khi bấm vào 1 ảnh. "use client" vì cần state cho lightbox (index ảnh đang mở/đóng).
// hasGalleryData() nằm ở lib/gallery.ts (không phải file này) — gọi trực tiếp 1 export từ file
// "use client" trong Server Component (page.tsx) ra client reference, không phải hàm thật.
export function GallerySection({ project, number }: { project: ProjectWithTier; number: number }) {
  const images = project.media.gallery ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // > 1, không phải > 0 — cùng ngưỡng với hasGalleryData() (lib/gallery.ts): chỉ 1 ảnh duy
  // nhất (= ảnh bìa) thì carousel này trùng lặp vô nghĩa với banner ảnh bìa đầu trang.
  if (images.length <= 1) return null;

  return (
    <SpecBlock id="section-hinh-anh" number={number} title="Hình ảnh">
      <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative h-28 w-40 shrink-0 snap-start overflow-hidden rounded-xl bg-paper-dim"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- carousel nhỏ, URL luôn là Storage URL tuyệt đối, dùng img thuần cho đơn giản */}
            <img
              src={img.url}
              alt={img.alt || `Ảnh dự án ${project.name}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Đóng"
            className="absolute right-4 top-4 text-[26px] leading-none text-white"
          >
            ✕
          </button>

          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i !== null ? i - 1 : i));
              }}
              aria-label="Ảnh trước"
              className="absolute left-2 flex h-10 w-10 items-center justify-center text-[30px] leading-none text-white"
            >
              ‹
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i !== null ? i + 1 : i));
              }}
              aria-label="Ảnh sau"
              className="absolute right-2 flex h-10 w-10 items-center justify-center text-[30px] leading-none text-white"
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- lightbox phóng to, URL luôn là Storage URL tuyệt đối */}
          <img
            src={images[lightboxIndex]!.url}
            alt={images[lightboxIndex]!.alt || `Ảnh dự án ${project.name}`}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <span className="absolute bottom-4 font-mono text-[12px] text-white/70">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </SpecBlock>
  );
}
