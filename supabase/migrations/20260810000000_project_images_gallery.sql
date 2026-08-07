-- ============================================================
-- project_images — thư viện ảnh (gallery) nhiều ảnh mỗi dự án, KHÁC ảnh đại diện
-- (project_media, quan hệ 1-1). sort_order quyết định thứ tự hiển thị trong carousel —
-- admin upload thêm ảnh sẽ nối tiếp vào cuối (xem admin-actions.ts saveGalleryImages()).
-- ============================================================
create table project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  image_url   text not null,
  image_alt   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index project_images_project_id_idx on project_images (project_id, sort_order);

-- Cùng mô hình RLS với mọi bảng khác (xem 20260804000001_rls_policies.sql): anon không có
-- policy nào (deny mặc định), authenticated toàn quyền. Trang công khai lẫn admin đều đọc/ghi
-- qua supabaseServer (service_role, bỏ qua RLS) — không có chỗ nào gọi bằng anon key từ trình
-- duyệt, nên không cần thêm policy "public read" riêng.
alter table project_images enable row level security;

create policy "admin_full_access" on project_images
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
