-- Digital Library reservation workflow
-- Run this once in the same MySQL database used by the server.

-- Reservations must support these statuses:
-- Pending  = waiting for an available copy
-- Accepted = admin accepted and the book was issued

ALTER TABLE reservations
MODIFY status VARCHAR(20) NOT NULL DEFAULT 'Pending';

-- Existing blank/null rows become pending requests.
UPDATE reservations
SET status = 'Pending'
WHERE status IS NULL OR status = '';

-- Fine policy used by the application:
-- Every loan is 7 days.
-- After the due date, fine = ₹10 per late day.
