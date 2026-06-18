-- Menambahkan kolom username dan password ke tabel users jika belum ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- (Opsional) Mengupdate data admin jika sudah ada, atau membuat admin baru
-- Pastikan password default terisi untuk bisa login
INSERT INTO users (email, username, full_name, role, password) 
VALUES ('admin@hemat.cafe', 'admin', 'Admin HEMAT', 'admin', 'admin123')
ON CONFLICT (email) 
DO UPDATE SET 
    username = EXCLUDED.username, 
    password = EXCLUDED.password;
