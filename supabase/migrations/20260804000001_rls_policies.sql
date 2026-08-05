-- canho.ai.vn — RLS policies
--
-- MÔ HÌNH GIẢ ĐỊNH: chỉ có 1 tài khoản admin duy nhất, không phân biệt nhiều
-- cấp quyền (editor/viewer/...). Trang công khai (SSR/SSG) và trang admin đều
-- đi qua server dùng service_role key (tự động bỏ qua RLS) — không có chỗ nào
-- trong code hiện tại gọi Supabase bằng anon key trực tiếp từ trình duyệt.
--
-- Vì vậy RLS ở đây chỉ là lưới an toàn dự phòng: role "anon" không có bất kỳ
-- policy nào (mặc định deny hoàn toàn), role "authenticated" được toàn quyền.
--
-- Nếu sau này có nhiều người dùng với quyền khác nhau, PHẢI viết lại policy
-- theo role/claim cụ thể — không dùng auth.role() = 'authenticated' chung
-- chung như dưới đây nữa.

alter table projects enable row level security;
alter table project_pricing enable row level security;
alter table project_price_entries enable row level security;
alter table project_amenities enable row level security;
alter table project_nearby_amenities enable row level security;
alter table project_timeline enable row level security;
alter table project_location enable row level security;
alter table project_nearby_routes enable row level security;
alter table project_media enable row level security;
alter table project_fit_for enable row level security;
alter table project_ai_content enable row level security;
alter table project_price_history enable row level security;
alter table api_usage_log enable row level security;
alter table api_budget_status enable row level security;

create policy "admin_full_access" on projects
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_pricing
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_price_entries
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_amenities
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_nearby_amenities
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_timeline
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_location
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_nearby_routes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_media
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_fit_for
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_ai_content
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on project_price_history
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on api_usage_log
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin_full_access" on api_budget_status
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
