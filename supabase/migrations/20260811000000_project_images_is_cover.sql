-- ============================================================
-- project_images.is_cover — gộp khái niệm "ảnh đại diện" (hero, project_media) vào album
-- ảnh chung (project_images). Đúng 1 ảnh/dự án có is_cover = true tại 1 thời điểm — admin
-- bấm "Đặt làm ảnh bìa" (setCoverImage() trong admin-actions.ts) sẽ set true cho ảnh đó,
-- false cho mọi ảnh khác CÙNG dự án. Nếu chưa ảnh nào được đánh dấu, tầng đọc dữ liệu
-- (supabase-mapping.ts) tự fallback về ảnh đầu tiên theo sort_order — không cần ràng buộc
-- "luôn có đúng 1 is_cover=true" ở cấp DB.
-- ============================================================
alter table project_images add column is_cover boolean not null default false;
