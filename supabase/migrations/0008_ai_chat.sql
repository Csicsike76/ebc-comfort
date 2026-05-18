-- 0008_ai_chat.sql
-- AI chat (Claude Haiku) + Retell phone AI + RAG knowledge base (pgvector)
-- Created: 2026-05-18

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_token text unique,
  locale text default 'hu',
  topic text,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  escalated_to_human boolean default false,
  escalation_reason text
);

create index if not exists chat_conversations_user_idx
  on public.chat_conversations (user_id, started_at desc);
create index if not exists chat_conversations_session_idx
  on public.chat_conversations (session_token);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade,
  role text check (role in ('user','assistant','system','tool')),
  content text not null,
  metadata jsonb,                              -- tokens, model, latency_ms
  created_at timestamptz default now() not null
);

create index if not exists chat_messages_conversation_idx
  on public.chat_messages (conversation_id, created_at);

-- =============================================================
-- RETELL PHONE AI (Apaserv-AI mintára)
-- =============================================================
create table if not exists public.call_logs (
  id uuid primary key default gen_random_uuid(),
  call_id text unique,                         -- Retell call_id
  user_id uuid references public.profiles(id) on delete set null,
  phone_number text,
  agent_id text,                                -- Retell agent_id (HU/EN)
  duration_seconds int,
  transcript_url text,
  recording_url text,
  summary text,
  topic text,
  escalation_needed boolean default false,
  cost_cents int,
  consent_recorded boolean default false,
  started_at timestamptz default now() not null,
  ended_at timestamptz
);

create index if not exists call_logs_user_idx
  on public.call_logs (user_id, started_at desc);
create index if not exists call_logs_phone_idx
  on public.call_logs (phone_number);

create table if not exists public.call_events (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references public.call_logs(id) on delete cascade,
  event_type text,                              -- 'tool_call','transfer','end'
  payload jsonb,
  created_at timestamptz default now() not null
);

-- =============================================================
-- RAG KNOWLEDGE BASE (pgvector)
-- =============================================================
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text check (source_type in ('article','course_module','faq','product')),
  source_id uuid,
  locale text not null,
  content text not null,
  embedding vector(1024),                       -- Voyage AI voyage-3 dim
  metadata jsonb,
  created_at timestamptz default now() not null
);

-- IVFFlat index for cosine similarity (fast approximate nearest neighbor)
create index if not exists kb_chunks_embedding_idx
  on public.kb_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
create index if not exists kb_chunks_source_idx
  on public.kb_chunks (source_type, source_id, locale);

create table if not exists public.chat_kb_retrievals (
  message_id uuid references public.chat_messages(id) on delete cascade,
  chunk_id uuid references public.kb_chunks(id) on delete cascade,
  similarity_score numeric(5,4),
  used_in_answer boolean default false,
  primary key (message_id, chunk_id)
);

-- Helper RPC: match kb_chunks by embedding similarity
create or replace function public.match_kb_chunks(
  query_embedding vector(1024),
  match_threshold float default 0.7,
  match_count int default 5,
  locale_filter text default null
)
returns table (
  id uuid,
  source_type text,
  source_id uuid,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    id, source_type, source_id, content,
    1 - (embedding <=> query_embedding) as similarity
  from public.kb_chunks
  where embedding is not null
    and (locale_filter is null or locale = locale_filter)
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
