import type { ProjectWithTier } from "./types";

// Tách riêng khỏi GallerySection.tsx ("use client", cần cho lightbox) — gọi trực tiếp từ
// page.tsx (Server Component) một hàm export từ file "use client" sẽ ra client reference,
// không phải hàm thật, gây lỗi "X is not a function" lúc build/SSG (đã xác nhận thật).
export function hasGalleryData(project: ProjectWithTier): boolean {
  return (project.media.gallery?.length ?? 0) > 0;
}
