-- canho.ai.vn — bảng contact_requests (form "Đăng ký tư vấn" công khai trên trang chi tiết dự án)
-- project_id dùng "on delete set null" (không cascade) — xoá dự án không được làm mất lịch sử
-- lead đã thu thập, chỉ mất liên kết tới dự án đó.

create table contact_requests (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid references projects(id) on delete set null,
  full_name           text not null,
  phone               text not null,
  email               text,
  wants_email_report  boolean not null default false,
  created_at          timestamptz not null default now()
);

create index contact_requests_project_id_idx on contact_requests (project_id);
create index contact_requests_created_at_idx on contact_requests (created_at desc);

-- Cùng mô hình RLS với các bảng khác (xem 20260804000001_rls_policies.sql): anon không có
-- policy nào (deny mặc định), authenticated toàn quyền. Form công khai ghi qua Server Action
-- dùng service_role (bỏ qua RLS) — không có chỗ nào gọi Supabase bằng anon key từ trình duyệt.
alter table contact_requests enable row level security;

create policy "admin_full_access" on contact_requests
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
