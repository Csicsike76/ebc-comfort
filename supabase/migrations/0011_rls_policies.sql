-- 0011_rls_policies.sql
-- Row-Level Security policies for all tables
-- Pattern: customer self-access, admin all-access, public-read for catalog/published
-- Created: 2026-05-18

-- =============================================================
-- ENABLE RLS ON ALL APP TABLES
-- =============================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.consents enable row level security;
alter table public.audit_log enable row level security;
alter table public.security_events enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.returns enable row level security;
alter table public.warranty_claims enable row level security;
alter table public.article_categories enable row level security;
alter table public.article_category_translations enable row level security;
alter table public.articles enable row level security;
alter table public.article_translations enable row level security;
alter table public.article_sources enable row level security;
alter table public.courses enable row level security;
alter table public.course_translations enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_module_translations enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_question_translations enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.donations enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_grants enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.call_logs enable row level security;
alter table public.call_events enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.chat_kb_retrievals enable row level security;
alter table public.locales enable row level security;
alter table public.i18n_keys enable row level security;
alter table public.i18n_translations enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.email_sent_log enable row level security;
alter table public.file_uploads enable row level security;
alter table public.nps_responses enable row level security;

-- =============================================================
-- PROFILES
-- =============================================================
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_admin_select_all" on public.profiles
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_update" on public.profiles
  for update using (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- USER_ROLES
-- =============================================================
create policy "user_roles_self_select" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "user_roles_admin_select" on public.user_roles
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "user_roles_super_admin_grant" on public.user_roles
  for insert with check (public.user_has_role(auth.uid(), 'super_admin'));
create policy "user_roles_super_admin_revoke" on public.user_roles
  for delete using (public.user_has_role(auth.uid(), 'super_admin'));

-- =============================================================
-- CONSENTS — append-only ledger
-- =============================================================
create policy "consents_self_select" on public.consents
  for select using (auth.uid() = user_id);
create policy "consents_admin_select" on public.consents
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "consents_self_insert" on public.consents
  for insert with check (auth.uid() = user_id);
-- NO update, NO delete: append-only audit trail

-- =============================================================
-- AUDIT LOG + SECURITY EVENTS — admin-only read, no client writes
-- =============================================================
create policy "audit_log_admin_select" on public.audit_log
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
-- inserts only via SECURITY DEFINER function log_audit()

create policy "security_events_admin_select" on public.security_events
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- PRODUCTS + RELATED — public read active, admin write
-- =============================================================
create policy "products_public_select_active" on public.products
  for select using (status = 'active' or public.user_has_role(auth.uid(), 'admin','super_admin','editor'));
create policy "products_admin_all" on public.products
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "product_translations_public_select" on public.product_translations
  for select using (true);
create policy "product_translations_admin_all" on public.product_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "product_images_public_select" on public.product_images
  for select using (true);
create policy "product_images_admin_all" on public.product_images
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "inventory_admin_select" on public.inventory
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "inventory_admin_all" on public.inventory
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- ORDERS — customer-own + admin all
-- =============================================================
create policy "orders_customer_select_own" on public.orders
  for select using (auth.uid() = user_id);
create policy "orders_admin_select_all" on public.orders
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "orders_customer_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on public.orders
  for update using (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "order_items_customer_select_own" on public.order_items
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));
create policy "order_items_admin_select_all" on public.order_items
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "order_items_customer_insert" on public.order_items
  for insert with check (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));
create policy "order_items_admin_all" on public.order_items
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "payments_customer_select_own" on public.payments
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));
create policy "payments_admin_all" on public.payments
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "shipments_customer_select_own" on public.shipments
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  ));
create policy "shipments_admin_all" on public.shipments
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "returns_customer_select_own" on public.returns
  for select using (auth.uid() = user_id);
create policy "returns_customer_insert_own" on public.returns
  for insert with check (auth.uid() = user_id);
create policy "returns_admin_all" on public.returns
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "warranty_claims_customer_select_own" on public.warranty_claims
  for select using (auth.uid() = user_id);
create policy "warranty_claims_customer_insert_own" on public.warranty_claims
  for insert with check (auth.uid() = user_id);
create policy "warranty_claims_admin_all" on public.warranty_claims
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- ARTICLES + EDUCATION — public read published, editor+ write
-- =============================================================
create policy "articles_public_select_published" on public.articles
  for select using (
    status = 'published' or public.user_has_role(auth.uid(), 'admin','super_admin','editor')
  );
create policy "articles_editor_all" on public.articles
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "article_translations_public_select" on public.article_translations
  for select using (true);
create policy "article_translations_editor_all" on public.article_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "article_categories_public_select" on public.article_categories
  for select using (true);
create policy "article_categories_admin_all" on public.article_categories
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "article_category_translations_public_select" on public.article_category_translations
  for select using (true);
create policy "article_category_translations_admin_all" on public.article_category_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "article_sources_public_select" on public.article_sources
  for select using (true);
create policy "article_sources_editor_all" on public.article_sources
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

-- Courses + modules + quiz: public read active, editor+ write
create policy "courses_public_select_active" on public.courses
  for select using (status = 'active' or public.user_has_role(auth.uid(), 'admin','super_admin','editor'));
create policy "courses_editor_all" on public.courses
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "course_translations_public_select" on public.course_translations
  for select using (true);
create policy "course_translations_editor_all" on public.course_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "course_modules_public_select" on public.course_modules
  for select using (true);
create policy "course_modules_editor_all" on public.course_modules
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "course_module_translations_public_select" on public.course_module_translations
  for select using (true);
create policy "course_module_translations_editor_all" on public.course_module_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "quiz_questions_public_select" on public.quiz_questions
  for select using (true);
create policy "quiz_questions_editor_all" on public.quiz_questions
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "quiz_question_translations_public_select" on public.quiz_question_translations
  for select using (true);
create policy "quiz_question_translations_editor_all" on public.quiz_question_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "course_enrollments_self_select" on public.course_enrollments
  for select using (auth.uid() = user_id);
create policy "course_enrollments_self_insert" on public.course_enrollments
  for insert with check (auth.uid() = user_id);
create policy "course_enrollments_admin_all" on public.course_enrollments
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "quiz_attempts_self_select" on public.quiz_attempts
  for select using (auth.uid() = user_id);
create policy "quiz_attempts_self_insert" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);
create policy "quiz_attempts_admin_select" on public.quiz_attempts
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- DONATIONS + SUPPORT
-- =============================================================
create policy "donations_public_select_recognized" on public.donations
  for select using (recognized_publicly = true and is_anonymous = false);
create policy "donations_self_select_own" on public.donations
  for select using (auth.uid() = donor_id);
create policy "donations_admin_select_all" on public.donations
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "donations_self_insert" on public.donations
  for insert with check (auth.uid() = donor_id or donor_id is null);

create policy "support_requests_self_select" on public.support_requests
  for select using (auth.uid() = user_id);
create policy "support_requests_admin_select" on public.support_requests
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "support_requests_self_insert" on public.support_requests
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "support_requests_admin_update" on public.support_requests
  for update using (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "support_grants_self_select" on public.support_grants
  for select using (auth.uid() = user_id);
create policy "support_grants_admin_all" on public.support_grants
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "newsletter_subscriptions_anyone_subscribe" on public.newsletter_subscriptions
  for insert with check (true);
create policy "newsletter_subscriptions_self_select" on public.newsletter_subscriptions
  for select using (auth.uid() = user_id);
create policy "newsletter_subscriptions_admin_select" on public.newsletter_subscriptions
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "newsletter_subscriptions_self_update_unsubscribe" on public.newsletter_subscriptions
  for update using (auth.uid() = user_id or user_id is null);

-- =============================================================
-- AI CHAT + KB
-- =============================================================
create policy "chat_conversations_self_select" on public.chat_conversations
  for select using (auth.uid() = user_id or user_id is null);
create policy "chat_conversations_admin_select" on public.chat_conversations
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
create policy "chat_conversations_anyone_insert" on public.chat_conversations
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "chat_messages_self_select" on public.chat_messages
  for select using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and (c.user_id = auth.uid() or c.user_id is null)
  ));
create policy "chat_messages_admin_select" on public.chat_messages
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
-- Inserts via Edge Function service_role only (not from client direct)

create policy "call_logs_self_select" on public.call_logs
  for select using (auth.uid() = user_id);
create policy "call_logs_admin_all" on public.call_logs
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "call_events_admin_select" on public.call_events
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "kb_chunks_public_select" on public.kb_chunks
  for select using (true);
create policy "kb_chunks_admin_all" on public.kb_chunks
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "chat_kb_retrievals_self_select" on public.chat_kb_retrievals
  for select using (exists (
    select 1 from public.chat_messages m
    join public.chat_conversations c on c.id = m.conversation_id
    where m.id = message_id and (c.user_id = auth.uid() or c.user_id is null)
  ));
create policy "chat_kb_retrievals_admin_select" on public.chat_kb_retrievals
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

-- =============================================================
-- I18N
-- =============================================================
create policy "locales_public_select" on public.locales for select using (true);
create policy "locales_admin_all" on public.locales
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "i18n_keys_public_select" on public.i18n_keys for select using (true);
create policy "i18n_keys_admin_all" on public.i18n_keys
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

create policy "i18n_translations_public_select" on public.i18n_translations
  for select using (true);
create policy "i18n_translations_editor_all" on public.i18n_translations
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin','editor'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin','editor'));

-- =============================================================
-- ADMIN + MARKETING
-- =============================================================
create policy "marketing_campaigns_admin_all" on public.marketing_campaigns
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "email_sent_log_self_select" on public.email_sent_log
  for select using (auth.uid() = user_id);
create policy "email_sent_log_admin_select" on public.email_sent_log
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "file_uploads_self_all" on public.file_uploads
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "file_uploads_admin_all" on public.file_uploads
  for all using (public.user_has_role(auth.uid(), 'admin','super_admin'))
  with check (public.user_has_role(auth.uid(), 'admin','super_admin'));

create policy "nps_responses_self_select" on public.nps_responses
  for select using (auth.uid() = user_id);
create policy "nps_responses_self_insert" on public.nps_responses
  for insert with check (auth.uid() = user_id);
create policy "nps_responses_admin_select" on public.nps_responses
  for select using (public.user_has_role(auth.uid(), 'admin','super_admin'));
