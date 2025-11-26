-- Initialize users table with manitto assignments
-- Generated automatically by init_users.js

-- Clear existing data
DELETE FROM public.messages;
DELETE FROM public.push_tokens;
DELETE FROM public.users;

-- Insert users
INSERT INTO public.users (name, email, initial_password, password_hash) VALUES ('seren.kim', 'seren.kim@kakaomobility.com', 'seren.kim', '$2b$10$hnj1B8SLm4AVg5ofcDG6ruRkAzYnxaikJf.Mtpco5vp9hQ4V.h9MG');
INSERT INTO public.users (name, email, initial_password, password_hash) VALUES ('rosa.j', 'rosa.j@kakaomobility.com', 'rosa.j', '$2b$10$rr/XjOvBhc3NSr8a4WQiwuG8iWK4NEG16emuGNa5CQ1HRCYb9XdNW');
INSERT INTO public.users (name, email, initial_password, password_hash) VALUES ('siena.jang', 'siena.jang@kakaomobility.com', 'siena.jang', '$2b$10$Qa8YejD.2TdwYrwBmEWECOOITcelzoRGNJJi13EXJsMxRRuU.UF9K');
INSERT INTO public.users (name, email, initial_password, password_hash) VALUES ('gram.eu', 'gram.eu@kakaomobility.com', 'gram.eu', '$2b$10$Pxhq4FGYY9guTl4YiBR4P..yaPs3XFqInBN6D3KOB38Z.STMRRRIa');

-- Update manitto relationships
UPDATE public.users SET manitto_to = (SELECT id FROM public.users WHERE name = 'rosa.j') WHERE name = 'seren.kim';
UPDATE public.users SET manitto_to = (SELECT id FROM public.users WHERE name = 'gram.eu') WHERE name = 'rosa.j';
UPDATE public.users SET manitto_to = (SELECT id FROM public.users WHERE name = 'siena.jang') WHERE name = 'gram.eu';
UPDATE public.users SET manitto_to = (SELECT id FROM public.users WHERE name = 'seren.kim') WHERE name = 'siena.jang';

UPDATE public.users SET manitto_from = (SELECT id FROM public.users WHERE name = 'seren.kim') WHERE name = 'rosa.j';
UPDATE public.users SET manitto_from = (SELECT id FROM public.users WHERE name = 'rosa.j') WHERE name = 'gram.eu';
UPDATE public.users SET manitto_from = (SELECT id FROM public.users WHERE name = 'gram.eu') WHERE name = 'siena.jang';
UPDATE public.users SET manitto_from = (SELECT id FROM public.users WHERE name = 'siena.jang') WHERE name = 'seren.kim';

-- Verify results
SELECT 
  u.name,
  u.email,
  u.initial_password,
  u_from.name as manitto_from,
  u_to.name as manitto_to
FROM public.users u
LEFT JOIN public.users u_from ON u.manitto_from = u_from.id
LEFT JOIN public.users u_to ON u.manitto_to = u_to.id
ORDER BY u.name;