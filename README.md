# Secure Cloud Storage System

A full-stack project featuring Role-Based Access Control and Hybrid Encryption (AES + RSA) performed entirely in the browser using the WebCrypto API.

## Core Features
- **Browser-Side Encryption**: Files never leave the browser unencrypted.
- **Hybrid Encryption**: AES-256-GCM for file data, RSA-OAEP for key exchange.
- **Supabase Integration**: Auth, Database (Postgres), and Storage (S3-compatible).
- **Role-Based Access Control (RBAC)**:
  - `admin`: Upload, Download, Delete.
  - `user`: Upload, Download.
  - `viewer`: Download.

## Project Structure
```text
secure-cloud-storage/
├── frontend/             # Next.js Application
│   ├── components/       # UI Components (FileUpload, FileList, RoleGuard)
│   └── pages/            # Pages (dashboard, upload, login)
├── encryption/           # WebCrypto Encryption Logic
│   ├── aesEncrypt.js     # AES-GCM Encryption
│   ├── aesDecrypt.js     # AES-GCM Decryption
│   ├── generateKeys.js   # RSA-OAEP Key Pair Generation
│   ├── rsaEncryptKey.js  # RSA Encryption of AES Keys
│   └── rsaDecryptKey.js  # RSA Decryption of AES Keys
├── auth/                 # Supabase Auth with key generation
├── rbac/                 # Role check utilities
├── storage/              # Upload/Download orchestration
├── db/                   # Database schema (schema.sql)
└── utils/                # Supabase client initialization
```

## Setup Instructions

### 1. Supabase Setup
- Create a new Supabase project.
- Run the SQL in `db/schema.sql` in the Supabase SQL Editor.
- Create a storage bucket named `secure-files`.
- Enable Public Access or set appropriate bucket policies.

### 2. Environment Variables
Create a `.env.local` file in the root (or `frontend/` folder):
```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js next react react-dom
```

### 4. Running the App
```bash
npm run dev
```

## Encryption Flow (Colossus Concept)
1. **Key Generation**: On signup, an RSA key pair is generated. The Public Key is stored in the `users` table, and the Private Key remains in the browser's `localStorage`.
2. **Encryption**: 
   - A random AES-256 key is generated for દરેક file.
   - The file is encrypted with AES-GCM.
   - The AES key is encrypted with the user's RSA Public Key.
3. **Storage**: The encrypted file is uploaded to storage, and metadata (including the encrypted AES key) is stored in Postgres.
4. **Decryption**: On download, the encrypted AES key is decrypted using the user's Private Key (stored locally), and then the file is decrypted using that AES key.
