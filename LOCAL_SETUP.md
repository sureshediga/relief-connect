# Local Development Setup

## Quick Start

1. **Make sure you have `.env.local` file** with the following variables:
   ```env
   # Database - Use direct connection for local development
   DATABASE_URL="postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   DIRECT_URL="postgresql://postgres:Ai4Farmer%242025@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Admin Configuration
   ADMIN_EMAILS="admin@example.com,another-admin@example.com"
   ```

2. **Generate Prisma Client** (if not already done):
   ```bash
   npx prisma generate
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Important Notes

- **Local Database**: Use port **5432** (direct connection) for local development
- **URL Encoding**: Make sure to URL encode special characters in passwords (e.g., `$` becomes `%24`)
- **Database Tables**: Make sure you've run the SQL migration in Supabase (see `migration.sql`)

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database connection errors
- Make sure your Supabase database is **active** (not paused)
- Verify your `DATABASE_URL` in `.env.local` uses port **5432** for local development
- Check that tables exist in Supabase Dashboard > Table Editor

### Prisma client errors
```bash
# Regenerate Prisma client
npx prisma generate
```

