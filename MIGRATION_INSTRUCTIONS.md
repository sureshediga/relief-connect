# Database Migration Instructions

## Problem
The database connection is working, but the tables don't exist yet. You need to create them.

## Solution
Since connection pooling (port 6543) doesn't support schema changes, you need to use the **direct connection** (port 5432) to create the tables.

## Step 1: Get Your Direct Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to **Settings > Database**
4. Scroll to **Connection string**
5. Select **Direct connection** (not Connection pooling)
6. Copy the connection string

It should look like:
```
postgresql://postgres:[PASSWORD]@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public
```

**Important:** 
- Use port **5432** (not 6543)
- URL encode special characters in your password (e.g., `$` becomes `%24`)

## Step 2: Run Migration Locally

### Option A: Using the Migration Script

1. Set the `DIRECT_URL` environment variable:
   ```bash
   # Windows PowerShell
   $env:DIRECT_URL="postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   
   # Windows CMD
   set DIRECT_URL=postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public
   
   # Mac/Linux
   export DIRECT_URL="postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   ```

2. Run the migration script:
   ```bash
   npm run db:migrate:netlify
   ```

### Option B: Using Prisma Directly

1. Set `DATABASE_URL` to your direct connection:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   
   # Windows CMD
   set DATABASE_URL=postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public
   
   # Mac/Linux
   export DATABASE_URL="postgresql://postgres:citizens4better%24uture@db.knkevoejnvqunsdapmit.supabase.co:5432/postgres?schema=public"
   ```

2. Run Prisma db push:
   ```bash
   npx prisma db push
   ```

## Step 3: Verify Tables Were Created

After running the migration, you should see output like:
```
✅ The database is now in sync with your Prisma schema.
```

You can verify by:
1. Going to Supabase Dashboard > Table Editor
2. You should see tables like: `users`, `accounts`, `sessions`, `efforts`, etc.

## Step 4: Test Your Application

After migration, try:
1. Sign up for a new account
2. Sign in with Google
3. Create a relief effort

## Troubleshooting

### Error: Can't reach database server
- Make sure your Supabase database is **active** (not paused)
- Check that you're using the **direct connection** (port 5432)
- Verify your password is URL-encoded correctly

### Error: Permission denied
- Make sure you're using the correct database password
- Check that your IP is not blocked in Supabase firewall settings

### Tables still don't exist
- Check Supabase Dashboard > Table Editor to see if tables were created
- Try running the migration again
- Check the error messages for specific issues

## Notes

- **Connection Pooling (6543)**: Use for application queries (already set in Netlify)
- **Direct Connection (5432)**: Use only for migrations and schema changes
- You only need to run migrations once (or when schema changes)
- After migration, your app will use the pooled connection for all queries

