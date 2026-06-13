UPDATE users SET password_hash = '$2a$10$wUOgENCoxkPgnErKdK1OXO7eLrmPv9zsNRMGlH4ZJ5WK.WjCuVoSa' WHERE username IN ('admin','manager','cashier','clerk','analyst');
SELECT username, password_hash, approved FROM users;
