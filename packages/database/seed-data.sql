-- Sample items for test@tala.app
INSERT INTO items (id, user_id, type, title, url, note, source_url, source_domain, created_at, updated_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'url', 'Next.js Documentation', 'https://nextjs.org/docs', 'Great resource for learning Next.js', 'https://nextjs.org/docs', 'nextjs.org', NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'url', 'Drizzle ORM', 'https://orm.drizzle.team', 'TypeScript ORM for SQL databases', 'https://orm.drizzle.team', 'orm.drizzle.team', NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'url', 'Tailwind CSS', 'https://tailwindcss.com', 'Utility-first CSS framework', 'https://tailwindcss.com', 'tailwindcss.com', NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'highlight', 'Key insight about React Server Components', NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'note', 'My coding philosophy', NULL, 'Keep it simple, ship fast, iterate often.', NULL, NULL, NOW(), NOW());

-- Sample collections
INSERT INTO collections (id, user_id, name, description, created_at, updated_at) VALUES
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'Web Development', 'Resources for learning web dev', NOW(), NOW()),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'Favorites', 'My favorite resources', NOW(), NOW());

-- Assign items to collections
INSERT INTO item_collections (item_id, collection_id) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f6a7b8c9-d0e1-2345-fabc-456789012345'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f6a7b8c9-d0e1-2345-fabc-456789012345'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'f6a7b8c9-d0e1-2345-fabc-456789012345'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a7b8c9d0-e1f2-3456-abcd-567890123456');

-- Sample favorites
INSERT INTO favorites (user_id, item_id, created_at) VALUES
  ('jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW()),
  ('jq4X5fUfdhnozjhGdyJ7f7NrPmAOdCxq', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', NOW());
