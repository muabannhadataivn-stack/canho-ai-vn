-- canho.ai.vn — cấp quyền cho service_role
--
-- service_role được thiết kế để bỏ qua RLS hoàn toàn (xem comment đầu
-- 20260804000001_rls_policies.sql), nhưng thiếu GRANT cấp bảng thì Postgres
-- chặn TRƯỚC KHI RLS được xét tới (lỗi 42501 permission denied).
-- Migration này cấp quyền đọc/ghi đầy đủ cho service_role trên toàn bộ bảng
-- hiện có + mọi bảng tạo sau này trong schema public.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
