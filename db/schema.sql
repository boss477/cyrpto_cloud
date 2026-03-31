-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'user', 'viewer')) DEFAULT 'viewer',
    public_key TEXT, -- RSA Public Key in JWK format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT, -- Nullable for text-only entries
    description TEXT, -- Encrypted notes
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    storage_path TEXT, -- Nullable for text-only entries
    encrypted_key TEXT NOT NULL, -- AES key encrypted with owner's RSA public key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CLEANUP UTILITY: Run this in SQL Editor if you want a fresh start
/*
TRUNCATE public.files CASCADE;
TRUNCATE public.users CASCADE;
*/

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Function to check user role without recursion
CREATE OR REPLACE FUNCTION get_user_role(target_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies for files table
DROP POLICY IF EXISTS "Users can view files they own" ON files;
CREATE POLICY "Users can view files they own" ON files FOR SELECT USING (
  auth.uid() = owner_id OR
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'viewer')
);

DROP POLICY IF EXISTS "Admin/User can upload files" ON files;
CREATE POLICY "Admin/User can upload files" ON files FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND 
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'user')
);

DROP POLICY IF EXISTS "Admin can delete files" ON files;
CREATE POLICY "Admin can delete files" ON files FOR DELETE USING (
  auth.uid() = owner_id OR 
  coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
);
