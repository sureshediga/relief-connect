# Netlify Deployment Guide for Relief Connect

This guide will walk you through deploying your Relief Connect application to Netlify.

## Prerequisites

1. **GitHub/GitLab/Bitbucket Account** - Your code should be in a Git repository
2. **Netlify Account** - Sign up at [netlify.com](https://www.netlify.com)
3. **PostgreSQL Database** - You'll need a cloud PostgreSQL database (recommended: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app))

## Step 1: Set Up Cloud PostgreSQL Database

Since Netlify doesn't provide a database, you need to set up a cloud PostgreSQL instance:

### Option A: Using Supabase (Recommended - Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your database password

### Option B: Using Neon (Recommended - Free Tier Available)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the **Connection String** from the dashboard

### Option C: Using Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project → Add PostgreSQL
3. Copy the **DATABASE_URL** from the service variables

## Step 2: Push Your Code to Git

Make sure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## Step 3: Configure Environment Variables Locally

Before deploying, make sure you have all required environment variables. Create a `.env.local` file (don't commit this):

```env
# Database (use your cloud PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# OAuth Providers (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important:** Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 4: Run Database Migrations

Before deploying, set up your database schema:

1. Update your local `.env.local` with the cloud database URL
2. Run migrations:

```bash
npx prisma generate
npx prisma db push
```

Or if you prefer migrations:

```bash
npx prisma migrate dev --name init
```

## Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-site.netlify.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)

## Step 6: Deploy to Netlify

### Method 1: Deploy via Netlify Dashboard (Recommended)

1. **Log in to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with your GitHub/GitLab/Bitbucket account

2. **Create a New Site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your Git provider and select your repository
   - Select the branch you want to deploy (usually `main` or `master`)

3. **Configure Build Settings**
   - **Build command:** `npm run build` (or leave default)
   - **Publish directory:** `.next` (or leave default)
   - Netlify should auto-detect Next.js settings

4. **Set Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add all your environment variables:
     ```
     DATABASE_URL=postgresql://...
     NEXTAUTH_URL=https://your-site.netlify.app
     NEXTAUTH_SECRET=your-secret-here
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
     NODE_ENV=production
     ```
   - **Important:** Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual Netlify site URL

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for the build to complete (this may take 5-10 minutes)

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy:**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site
   - Set build command: `npm run build`
   - Set publish directory: `.next`

4. **Set Environment Variables:**
   ```bash
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"
   netlify env:set NEXTAUTH_SECRET "your-secret"
   netlify env:set GOOGLE_CLIENT_ID "your-client-id"
   netlify env:set GOOGLE_CLIENT_SECRET "your-client-secret"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
   netlify env:set NODE_ENV "production"
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Step 7: Post-Deployment Setup

### Update Database Connection

After deployment, ensure your production database is accessible from Netlify's servers. Some database providers require IP whitelisting:

- **Supabase:** Go to Settings → Database → Connection Pooling, enable it
- **Neon:** Usually works out of the box
- **Railway:** Check firewall settings

### Run Database Migrations on Production

You can run migrations using Netlify's build command or manually:

1. **Via Netlify Build:**
   - Add a build hook or use Netlify Functions
   - Or run migrations locally pointing to production DB (not recommended)

2. **Recommended: Use Prisma Migrate Deploy**
   - Add a script to your `package.json`:
     ```json
     "db:migrate:deploy": "prisma migrate deploy"
     ```
   - Run it locally with production DATABASE_URL:
     ```bash
     DATABASE_URL="your-production-url" npm run db:migrate:deploy
     ```

### Update OAuth Redirect URIs

Make sure your Google OAuth redirect URI matches your Netlify URL:
- `https://your-site.netlify.app/api/auth/callback/google`

## Step 8: Verify Deployment

1. **Check Build Logs**
   - Go to **Deploys** tab in Netlify dashboard
   - Check for any build errors

2. **Test Your Application**
   - Visit your Netlify URL
   - Test authentication (Google Sign-in)
   - Test database connections
   - Test API routes

3. **Check Function Logs**
   - Go to **Functions** tab to see API route logs

## Step 9: Custom Domain (Optional)

1. Go to **Domain settings** → **Add custom domain**
2. Follow Netlify's instructions to configure DNS
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your custom domain

## Troubleshooting

### Build Fails with Prisma Error

- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- Check that Prisma schema is committed to Git
- Verify `DATABASE_URL` is set correctly

### Database Connection Errors

- Verify `DATABASE_URL` is correct in Netlify environment variables
- Check if your database allows connections from Netlify's IPs
- For Supabase, use connection pooling URL

### OAuth Errors

- Verify redirect URIs match exactly (including https)
- Check `NEXTAUTH_URL` matches your site URL
- Ensure `NEXTAUTH_SECRET` is set

### API Routes Not Working

- Check Netlify Functions logs
- Verify environment variables are set
- Ensure API routes are in `src/app/api/` directory

### Images Not Loading

- Update `next.config.js` to include your Netlify domain in `images.domains`
- For uploaded images, consider using a CDN (S3, Cloudinary, etc.)

## Important Notes

1. **File Uploads:** The current implementation saves files to `public/uploads`, which won't persist on Netlify. Consider using:
   - AWS S3
   - Cloudinary
   - Netlify Blob Storage

2. **Environment Variables:** Never commit `.env.local` to Git. Always set them in Netlify dashboard.

3. **Database Migrations:** Run migrations before or immediately after deployment.

4. **Build Time:** First build may take 10-15 minutes. Subsequent builds are faster.

5. **Cold Starts:** Netlify Functions may have cold starts. Consider upgrading plan if needed.

## Next Steps

- Set up continuous deployment (automatic on Git push)
- Configure custom domain
- Set up monitoring
- Consider upgrading to Netlify Pro for better performance

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

