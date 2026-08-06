-- Bucket "project-images" — lưu ảnh đại diện (hero image) dự án. Public đọc (không cần auth)
-- vì ảnh hiển thị trên trang chi tiết công khai /[tinh]/[slug], không phải khu vực admin.
-- Giới hạn 5MB/ảnh, chỉ nhận jpg/jpeg/png/webp — khớp đúng validate phía
-- admin-actions.ts saveHeroImage() (chặn double, không chỉ tin tưởng 1 lớp).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Đọc công khai — ẩn danh cũng đọc được (trang chi tiết dự án là trang công khai không yêu
-- cầu đăng nhập). Bucket public=true đã tự phục vụ GET ẩn danh, thêm policy SELECT tường minh
-- để không phụ thuộc hoàn toàn vào cờ public của bucket.
create policy "project-images public read"
on storage.objects for select
to public
using (bucket_id = 'project-images');

-- Upload/sửa/xoá — chỉ authenticated (admin, đã qua middleware.ts + Supabase Auth). Server
-- Actions của admin dùng supabaseServer (service_role, bỏ qua RLS) nên các policy này không
-- chặn luồng ghi hiện có qua updateProject() — đây là lớp phòng thủ nếu sau này có upload
-- trực tiếp từ client (browser client, không qua service_role).
create policy "project-images authenticated insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-images');

create policy "project-images authenticated update"
on storage.objects for update
to authenticated
using (bucket_id = 'project-images');

create policy "project-images authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-images');
