-- 0006_articles_education.sql
-- Article categories + articles + courses + quiz
-- Created: 2026-05-18

create table if not exists public.article_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_order int default 0,
  created_at timestamptz default now() not null
);

create table if not exists public.article_category_translations (
  category_id uuid references public.article_categories(id) on delete cascade,
  locale text not null,
  name text not null,
  description text,
  primary key (category_id, locale)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.article_categories(id) on delete set null,
  status text default 'draft' check (status in ('draft','published','archived')),
  featured_image_url text,
  reading_time_minutes int,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists articles_status_published_idx
  on public.articles (status, published_at desc);
drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.touch_updated_at();

create table if not exists public.article_translations (
  article_id uuid references public.articles(id) on delete cascade,
  locale text not null,
  title text not null,
  excerpt text,
  body_markdown text not null,
  meta_title text,
  meta_description text,
  primary key (article_id, locale)
);

create index if not exists article_translations_locale_idx
  on public.article_translations (locale);

create table if not exists public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  citation text not null,
  url text,
  display_order int default 0
);

-- =============================================================
-- E-LEARNING (Apaserv SSM mintára)
-- =============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  status text default 'draft' check (status in ('draft','active','archived')),
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  estimated_duration_minutes int,
  certificate_template_url text,
  created_at timestamptz default now() not null
);

create table if not exists public.course_translations (
  course_id uuid references public.courses(id) on delete cascade,
  locale text not null,
  title text not null,
  description text,
  primary key (course_id, locale)
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  display_order int not null,
  content_type text check (content_type in ('text','video','quiz','pdf')),
  content_url text,
  body_markdown text,
  created_at timestamptz default now() not null
);

create index if not exists course_modules_course_order_idx
  on public.course_modules (course_id, display_order);

create table if not exists public.course_module_translations (
  module_id uuid references public.course_modules(id) on delete cascade,
  locale text not null,
  title text not null,
  body_markdown text,
  primary key (module_id, locale)
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade,
  display_order int not null,
  question_type text check (question_type in ('single','multi','true_false')),
  correct_answer_keys text[]
);

create table if not exists public.quiz_question_translations (
  question_id uuid references public.quiz_questions(id) on delete cascade,
  locale text not null,
  question_text text not null,
  options jsonb not null,                  -- {"a":"Opció A","b":"..."}
  explanation text,
  primary key (question_id, locale)
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  certificate_issued_at timestamptz,
  certificate_pdf_url text,
  unique (user_id, course_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  question_id uuid references public.quiz_questions(id) on delete cascade,
  selected_answers text[],
  is_correct boolean,
  attempted_at timestamptz default now() not null
);

create index if not exists quiz_attempts_user_idx
  on public.quiz_attempts (user_id, attempted_at desc);
