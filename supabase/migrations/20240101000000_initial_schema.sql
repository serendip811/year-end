-- Create users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  initial_password text not null,
  password_hash text not null,
  manitto_from uuid,
  manitto_to uuid,
  created_at timestamp default now()
);

-- Create messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender uuid not null references users(id),
  receiver uuid not null references users(id),
  content text not null,
  created_at timestamp default now()
);

-- Create push_tokens table
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  token text not null,
  updated_at timestamp default now()
);

-- Enable Realtime for messages
alter publication supabase_realtime add table messages;
