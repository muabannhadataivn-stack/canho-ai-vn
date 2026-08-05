-- File TẠM để test thủ công qua SQL Editor (Supabase Dashboard).
-- KHÔNG phải migration — không đưa vào supabase/migrations/, không chạy qua CLI.
-- Insert 1 dự án tối thiểu để xác nhận trang /can-ho/tp-hcm/du-an-test-dau-tien render đúng
-- với dữ liệu thật từ Supabase.

with new_project as (
  insert into projects (slug, province_slug, name, province, sales_status, updated_at, publication_status)
  values ('du-an-test-dau-tien', 'tp-hcm', 'Dự án Test Đầu Tiên', 'TP.HCM', 'dang-mo-ban', current_date, 'published')
  returning id
),
pricing as (
  insert into project_pricing (project_id, price_min, price_max, price_unit)
  select id, 40, 50, 'trieu-m2' from new_project
  returning project_id
)
insert into project_timeline (project_id, label, date, done, sort_order)
select id, t.label, t.date, t.done, t.sort_order
from new_project,
  (values
    ('Khởi công', 'Quý 1/2024', true, 0),
    ('Bàn giao', 'Dự kiến quý 4/2026', false, 1)
  ) as t(label, date, done, sort_order);

-- Dọn dẹp sau khi test xong (chạy riêng, bỏ comment):
-- delete from projects where slug = 'du-an-test-dau-tien';
-- (project_pricing / project_timeline tự xoá theo do "on delete cascade")
