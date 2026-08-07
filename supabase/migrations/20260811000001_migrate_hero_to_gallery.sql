-- ============================================================
-- Migrate dữ liệu: chuyển ảnh đại diện đã có trong project_media (bảng cũ, sắp ngừng dùng)
-- sang project_images (bảng album chung, dùng từ giờ trở đi) — đánh dấu is_cover = true,
-- sort_order = 0, KHÔNG xoá gì khỏi project_media (giữ nguyên làm backup, xem mục 5 báo cáo).
--
-- Viết TỔNG QUÁT (không hardcode id dự án cụ thể) + AN TOÀN CHẠY LẠI NHIỀU LẦN (idempotent):
-- chỉ copy các dự án có hero_image_url thật trong project_media VÀ CHƯA có ảnh nào được đánh
-- dấu is_cover trong project_images (tránh tạo trùng nếu chạy lại, hoặc ghi đè ảnh bìa admin
-- đã tự chọn sau này). Tại thời điểm viết migration này, có đúng 2 dự án khớp điều kiện:
-- Akari City và Vinhomes Central Park.
-- ============================================================
insert into project_images (project_id, image_url, image_alt, sort_order, is_cover)
select
  pm.project_id,
  pm.hero_image_url,
  pm.hero_image_alt,
  0,
  true
from project_media pm
where pm.hero_image_url is not null
  and not exists (
    select 1 from project_images pi where pi.project_id = pm.project_id and pi.is_cover = true
  );
