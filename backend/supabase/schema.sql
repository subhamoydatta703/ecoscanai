create extension if not exists pgcrypto;

create table if not exists public.scan_history (
    id uuid primary key default gen_random_uuid(),
    repository text not null,
    repository_label text not null,
    health_score integer not null default 0,
    total_files_scanned integer not null default 0,
    anomalies_found integer not null default 0,
    critical_patterns_detected integer not null default 0,
    pattern_counts jsonb not null default '{}'::jsonb,
    artifact_path text,
    storage_bucket text,
    scanned_at timestamptz not null default timezone('utc', now())
);

create index if not exists scan_history_scanned_at_idx
    on public.scan_history (scanned_at desc);

create index if not exists scan_history_repository_idx
    on public.scan_history (repository_label);

alter table public.scan_history enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('scan-artifacts', 'scan-artifacts', false, 5242880, array['application/json'])
on conflict (id) do nothing;
