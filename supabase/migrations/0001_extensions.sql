-- 0001_extensions.sql
-- Required PostgreSQL extensions for EBC NGO Platform
-- Created: 2026-05-18

-- uuid-ossp: UUID generation (already loaded by Supabase default, idempotent)
create extension if not exists "uuid-ossp" with schema extensions;

-- pgcrypto: gen_random_uuid() + crypto functions
create extension if not exists pgcrypto with schema extensions;

-- pg_trgm: trigram-based fuzzy text search (names, addresses)
create extension if not exists pg_trgm with schema extensions;

-- vector (pgvector): semantic embeddings for AI chat RAG knowledge base
create extension if not exists vector with schema extensions;

-- citext: case-insensitive text (useful for emails)
create extension if not exists citext with schema extensions;

-- comment for future maintainers
comment on extension vector is 'pgvector — semantic search for AI chat RAG (kb_chunks.embedding)';
comment on extension pg_trgm is 'Trigram fuzzy search for product/article search';
