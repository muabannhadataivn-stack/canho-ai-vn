-- canho.ai.vn — schema khởi tạo (Postgres / Supabase)
-- Enum giá trị bám theo src/lib/types.ts — nếu sửa union type ở đó, sửa CHECK tương ứng ở đây.
--
-- LƯU Ý: RLS đang TẮT trên toàn bộ bảng. Supabase tự expose mọi bảng qua PostgREST,
-- nên PHẢI bật RLS + viết policy trước khi trỏ anon/public key vào project này.

create extension if not exists pgcrypto;

-- ============================================================
-- projects — bảng chính, 1 dòng/dự án
-- ============================================================
create table projects (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null,
  province_slug       text not null,
  name                text not null,
  province            text not null,
  district            text,
  developer           text,
  sales_status        text not null default 'dang-cap-nhat'
                        check (sales_status in ('sap-mo-ban', 'dang-mo-ban', 'da-ban-giao', 'dang-cap-nhat')),
  scale               text,
  units               text,
  building_density    text,
  start_date          text,  -- free text ("Quý 2/2018") — không đủ đảm bảo là ngày thật
  handover_expected   text,  -- free text ("Dự kiến quý 3/2026")
  updated_at          date not null default current_date,  -- phải khớp dateModified JSON-LD
  publication_status  text not null default 'draft'
                        check (publication_status in ('draft', 'published')),
  created_at          timestamptz not null default now(),
  created_by          uuid references auth.users(id) on delete set null,

  unique (province_slug, slug)
);

create index projects_publication_status_idx on projects (publication_status);
create index projects_province_slug_idx on projects (province_slug);
create index projects_sales_status_idx on projects (sales_status);

-- ============================================================
-- project_pricing — 1-1 với projects
-- ============================================================
create table project_pricing (
  project_id  uuid primary key references projects(id) on delete cascade,
  price_min   numeric,
  price_max   numeric,
  price_unit  text check (price_unit in ('trieu-m2', 'ty-can')),
  price_as_of date,
  price_note  text
);

-- ============================================================
-- project_price_entries — 1-nhiều, bảng giá theo loại căn
-- ============================================================
create table project_price_entries (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type       text not null,  -- VD: "2PN"
  area_min   numeric,
  area_max   numeric,
  price_min  numeric,
  price_max  numeric
);

create index project_price_entries_project_id_idx on project_price_entries (project_id);

-- ============================================================
-- project_amenities — 1-nhiều, tiện ích nội khu
-- ============================================================
create table project_amenities (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  icon        text not null default 'default'
                check (icon in ('park', 'pool', 'school', 'mall', 'sport', 'bus', 'security', 'elevator', 'parking', 'default')),
  name        text not null,
  description text
);

create index project_amenities_project_id_idx on project_amenities (project_id);

-- ============================================================
-- project_nearby_amenities — 1-nhiều, tiện ích lân cận (từ Places API)
-- ============================================================
create table project_nearby_amenities (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id) on delete cascade,
  category         text not null
                     check (category in ('truong-hoc', 'benh-vien', 'sieu-thi-ttTM', 'cong-vien', 'cho', 'ngan-hang')),
  name             text not null,
  distance_meters  integer,
  within_project   boolean not null default false
);

create index project_nearby_amenities_project_id_idx on project_nearby_amenities (project_id);

-- ============================================================
-- project_timeline — 1-nhiều, mốc tiến độ
-- ============================================================
create table project_timeline (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  label      text not null,
  date       text not null,  -- free text ("Quý 3/2026") — không parse được thành date thật
  done       boolean not null default false,
  sort_order integer not null default 0
);

create index project_timeline_project_id_idx on project_timeline (project_id, sort_order);

-- ============================================================
-- project_location — 1-1
-- ============================================================
create table project_location (
  project_id   uuid primary key references projects(id) on delete cascade,
  address      text,
  lat          double precision,
  lng          double precision,
  commute_note text
);

-- ============================================================
-- project_nearby_routes — 1-nhiều
-- ============================================================
create table project_nearby_routes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name       text not null,
  type       text not null
);

create index project_nearby_routes_project_id_idx on project_nearby_routes (project_id);

-- ============================================================
-- project_media — 1-1
-- ============================================================
create table project_media (
  project_id     uuid primary key references projects(id) on delete cascade,
  hero_image_url text,
  hero_image_alt text
);

-- ============================================================
-- project_fit_for — 1-nhiều
-- ============================================================
create table project_fit_for (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  text       text not null,
  caution    boolean not null default false,
  sort_order integer not null default 0
);

create index project_fit_for_project_id_idx on project_fit_for (project_id, sort_order);

-- ============================================================
-- project_ai_content — nội dung AI sinh (đoạn mở đầu + FAQ)
-- Mỗi lần sinh lại là 1 dòng mới (không update-in-place) để audit được lịch sử
-- và rollback nếu bản mới lỗi — bản hiện hành là dòng có generated_at mới nhất.
-- ============================================================
create table project_ai_content (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects(id) on delete cascade,
  intro_text     text,
  faq_json       jsonb,
  generated_at   timestamptz not null default now(),
  model_version  text
);

create index project_ai_content_project_id_idx on project_ai_content (project_id, generated_at desc);

-- ============================================================
-- project_price_history — KHÔNG ghi đè, lưu lịch sử (CONTENT-PIPELINE.md)
-- ============================================================
create table project_price_history (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  price_min   numeric,
  price_max   numeric,
  recorded_at timestamptz not null default now()
);

create index project_price_history_project_id_idx on project_price_history (project_id, recorded_at desc);

-- ============================================================
-- api_usage_log — theo dõi ngân sách Google API
-- ============================================================
create table api_usage_log (
  id                bigserial primary key,
  api_name          text not null,
  project_id        uuid references projects(id) on delete set null,
  cost_estimate_usd numeric(10, 4) not null default 0,
  called_at         timestamptz not null default now()
);

create index api_usage_log_called_at_idx on api_usage_log (called_at);
create index api_usage_log_project_id_idx on api_usage_log (project_id);

-- ============================================================
-- api_budget_status — 1 dòng/tháng, tổng chi phí tháng đó
-- "month" = ngày đầu tháng (VD: 2026-08-01), PK đảm bảo đúng 1 dòng mỗi tháng;
-- tháng hiện tại = dòng có month = date_trunc('month', current_date).
-- ============================================================
create table api_budget_status (
  month           date primary key,
  total_spent_usd numeric(10, 2) not null default 0,
  is_capped       boolean not null default false
);
