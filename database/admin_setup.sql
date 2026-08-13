-- Promote an existing registered account to Admin.
-- Replace the email below with your actual admin email, then run this once.

UPDATE members
SET role = 'admin'
WHERE email = 'shwet@example.com';

SELECT id, name, email, role
FROM members
WHERE email = 'shwet@example.com';
