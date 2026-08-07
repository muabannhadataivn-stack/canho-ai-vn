import type { ProjectWithTier } from "./types";

// Tách riêng khỏi GallerySection.tsx ("use client", cần cho lightbox) — gọi trực tiếp từ
// page.tsx (Server Component) một hàm export từ file "use client" sẽ ra client reference,
// không phải hàm thật, gây lỗi "X is not a function" lúc build/SSG (đã xác nhận thật).
// > 1 (không phải > 0) — ảnh đầu tiên trong project_images luôn là/được coi là ảnh bìa
// (banner đầu trang, xem supabase-mapping.ts), nên carousel "Hình ảnh" chỉ có ý nghĩa khi có
// ÍT NHẤT 1 ảnh KHÁC ngoài ảnh bìa. Chỉ 1 ảnh duy nhất → tab/section này trùng lặp vô nghĩa
// với banner ảnh bìa đã hiển thị sẵn đầu trang.
export function hasGalleryData(project: ProjectWithTier): boolean {
  return (project.media.gallery?.length ?? 0) > 1;
}
