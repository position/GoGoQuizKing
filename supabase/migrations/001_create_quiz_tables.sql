-- Create auth profiles table (extends auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    preferred_username text,
    provider text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create notice table
create table if not exists public.notice (
    id bigserial primary key,
    title text not null,
    body text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create notice comments table
create table if not exists public.comments (
    id bigserial primary key,
    post_id bigint not null references public.notice(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    parent_id bigint references public.comments(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create questions/trivia table
create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    correct_answer text not null,
    incorrect_answers text[] not null,
    category text not null,
    difficulty text not null,
    question_type text not null,
    is_niche boolean default false,
    regions text[] default array[]::text[],
    tags text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create quiz results table
create table if not exists public.quiz_results (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    user_answer text not null,
    is_correct boolean not null,
    answered_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.notice enable row level security;
alter table public.comments enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_results enable row level security;

-- Create RLS Policies

-- Profiles: Users can read their own profile, and anyone can read any profile
create policy "Users can view profiles"
    on public.profiles for select
    using (true);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Notice: Anyone can read, authenticated users can create, users can update/delete own posts
create policy "Anyone can view notices"
    on public.notice for select
    using (true);

create policy "Authenticated users can create notices"
    on public.notice for insert
    with check (auth.uid() = user_id);

create policy "Users can update own notices"
    on public.notice for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own notices"
    on public.notice for delete
    using (auth.uid() = user_id);

-- Comments: Anyone can read, authenticated users can create, users can update/delete own comments
create policy "Anyone can view comments"
    on public.comments for select
    using (true);

create policy "Authenticated users can create comments"
    on public.comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update own comments"
    on public.comments for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own comments"
    on public.comments for delete
    using (auth.uid() = user_id);

-- Questions: Anyone can read, only authenticated users can create
create policy "Anyone can view questions"
    on public.questions for select
    using (true);

-- Quiz Results: Users can only view/create their own results
create policy "Users can view own quiz results"
    on public.quiz_results for select
    using (auth.uid() = user_id);

create policy "Authenticated users can create quiz results"
    on public.quiz_results for insert
    with check (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_notice_user_id on public.notice(user_id);
create index idx_notice_created_at on public.notice(created_at desc);
create index idx_comments_post_id on public.comments(post_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_parent_id on public.comments(parent_id);
create index idx_quiz_results_user_id on public.quiz_results(user_id);
create index idx_quiz_results_question_id on public.quiz_results(question_id);
create index idx_questions_category on public.questions(category);
create index idx_questions_difficulty on public.questions(difficulty);
