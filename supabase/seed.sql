-- Insert Users
INSERT INTO users (name, email, initial_password, password_hash) VALUES
('Alice', 'alice@example.com', '123456', '$2b$10$oihqpvfqSdEd4qna5tmrsOSwPITrLTqusBPEByEiVQUYndLqHN.k.'), -- Password: 123456
('Bob', 'bob@example.com', '123456', '$2b$10$oihqpvfqSdEd4qna5tmrsOSwPITrLTqusBPEByEiVQUYndLqHN.k.'),
('Charlie', 'charlie@example.com', '123456', '$2b$10$oihqpvfqSdEd4qna5tmrsOSwPITrLTqusBPEByEiVQUYndLqHN.k.'),
('David', 'david@example.com', '123456', '$2b$10$oihqpvfqSdEd4qna5tmrsOSwPITrLTqusBPEByEiVQUYndLqHN.k.');

-- Set Matches (A -> B -> C -> D -> A)
-- We need UUIDs, so this is just pseudo-code. In real seed, we'd use DO block or specific UUIDs.

DO $$
DECLARE
  alice_id uuid;
  bob_id uuid;
  charlie_id uuid;
  david_id uuid;
BEGIN
  SELECT id INTO alice_id FROM users WHERE name = 'Alice';
  SELECT id INTO bob_id FROM users WHERE name = 'Bob';
  SELECT id INTO charlie_id FROM users WHERE name = 'Charlie';
  SELECT id INTO david_id FROM users WHERE name = 'David';

  -- Alice -> Bob
  UPDATE users SET manitto_to = bob_id WHERE id = alice_id;
  UPDATE users SET manitto_from = alice_id WHERE id = bob_id;

  -- Bob -> Charlie
  UPDATE users SET manitto_to = charlie_id WHERE id = bob_id;
  UPDATE users SET manitto_from = bob_id WHERE id = charlie_id;

  -- Charlie -> David
  UPDATE users SET manitto_to = david_id WHERE id = charlie_id;
  UPDATE users SET manitto_from = charlie_id WHERE id = david_id;

  -- David -> Alice
  UPDATE users SET manitto_to = alice_id WHERE id = david_id;
  UPDATE users SET manitto_from = david_id WHERE id = alice_id;
END $$;
