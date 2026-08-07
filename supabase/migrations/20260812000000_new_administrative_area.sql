-- ============================================================
-- project_location.new_administrative_area — địa giới hành chính mới (sau sáp nhập 2025),
-- admin nhập tay/xác nhận theo từng dự án (KHÔNG tự động suy luận từ địa chỉ cũ — chưa có
-- bảng ánh xạ tỉnh cũ -> tỉnh/xã mới với dữ liệu thật, xem báo cáo kèm theo). Nullable, để
-- trống nếu admin chưa xác định được.
-- ============================================================
alter table project_location add column new_administrative_area text;
