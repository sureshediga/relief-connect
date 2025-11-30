# Netlify Deployment Checklist

Use this checklist to ensure a smooth deployment to Netlify.

## Pre-Deployment

- [ ] Code is committed and pushed to Git repository
- [ ] Cloud PostgreSQL database is set up (Supabase/Neon/Railway)
- [ ] Database connection string is ready
- [ ] Google OAuth credentials are configured
- [ ] `NEXTAUTH_SECRET` is generated (use: `openssl rand -base64 32`)
- [ ] All environment variables are documented

## Database Setup

- [ ] Database is created and accessible
- [ ] Connection string format: `postgresql://user:password@host:5432/database?schema=public`
- [ ] Database allows connections from external IPs (if required)
- [ ] Prisma schema is up to date
- [ ] Database migrations are ready (or use `prisma db push`)

## Configuration Files

- [ ] `netlify.toml` is created and configured
- [ ] `package.json` has `postinstall` script: `"postinstall": "prisma generate"`
- [ ] `package.json` build script includes Prisma: `"build": "prisma generate && next build"`
- [ ] `.gitignore` includes `.env*.local` and `.env`
- [ ] `next.config.js` includes Netlify domain in image domains

## Environment Variables (Set in Netlify Dashboard)

- [ ] `DATABASE_URL` - Your cloud PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Netlify site URL (e.g., `https://your-site.netlify.app`)
- [ ] `NEXTAUTH_SECRET` - Random secure string (32+ characters)
- [ ] `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- [ ] `NEXT_PUBLIC_APP_URL` - Your Netlify site URL
- [ ] `NODE_ENV` - Set to `production`

## OAuth Configuration

- [ ] Google OAuth redirect URI added: `https://your-site.netlify.app/api/auth/callback/google`
- [ ] Local redirect URI kept: `http://localhost:3000/api/auth/callback/google`

## Deployment Steps

- [ ] Netlify account is created
- [ ] Site is created and linked to Git repository
- [ ] Build settings are configured:
  - Build command: `npm run build`
  - Publish directory: `.next`
- [ ] All environment variables are set in Netlify dashboard
- [ ] Initial deployment is triggered
- [ ] Build completes successfully (check logs)

## Post-Deployment

- [ ] Database migrations are run (if using migrations)
- [ ] Site is accessible at Netlify URL
- [ ] Authentication (Google Sign-in) works
- [ ] Database connections work
- [ ] API routes are functional
- [ ] Images load correctly
- [ ] No console errors in browser

## Testing Checklist

- [ ] User can sign up/sign in
- [ ] User can create a relief effort
- [ ] User can join as volunteer
- [ ] User can submit help requests
- [ ] User can contribute resources
- [ ] User can make donations
- [ ] Media uploads work (if implemented)
- [ ] Member invitations work
- [ ] All pages load without errors

## Optional Enhancements

- [ ] Custom domain is configured
- [ ] SSL certificate is active (automatic with Netlify)
- [ ] Analytics are set up (if needed)
- [ ] Error tracking is configured (Sentry, etc.)
- [ ] File uploads use cloud storage (S3, Cloudinary, etc.)

## Troubleshooting

If deployment fails, check:

1. **Build Logs** - Look for errors in Netlify deploy logs
2. **Environment Variables** - Verify all are set correctly
3. **Database Connection** - Test connection string locally
4. **Prisma Generation** - Ensure `postinstall` script runs
5. **Node Version** - Netlify should use Node 18.x (set in `netlify.toml`)

## Quick Commands Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Test database connection locally
DATABASE_URL="your-url" npx prisma db push

# Run migrations (if using)
DATABASE_URL="your-url" npx prisma migrate deploy

# Test build locally
npm run build
```

## Support Resources

- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/nextjs/
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

