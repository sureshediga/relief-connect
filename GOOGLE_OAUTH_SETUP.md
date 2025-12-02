# Google OAuth Setup Guide

## Step 1: Create a New OAuth Client in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select or Create a Project**
   - If you don't have a project, click "Create Project"
   - Give it a name (e.g., "Relief Connect")
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in required fields:
       - App name: "Relief Connect"
       - User support email: Your email
       - Developer contact: Your email
     - Click "Save and Continue"
     - Add scopes: `email`, `profile`, `openid`
     - Click "Save and Continue"
     - Add test users (if needed)
     - Click "Save and Continue"

5. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: "Relief Connect Web Client"
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://superb-cactus-77d812.netlify.app
     ```
   - **Authorized redirect URIs:** (IMPORTANT: No trailing slashes!)
     ```
     http://localhost:3000/api/auth/callback/google
     https://superb-cactus-77d812.netlify.app/api/auth/callback/google
     ```
     **Note**: Make sure there are NO trailing slashes and the path is exactly `/api/auth/callback/google`
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: Copy this
     - **Client Secret**: Copy this (click "Show" if hidden)
   - Save these securely

## Step 2: Update Local Environment Variables

Update your `.env.local` file:

```env
GOOGLE_CLIENT_ID="your-new-client-id-here"
GOOGLE_CLIENT_SECRET="your-new-client-secret-here"
```

## Step 3: Update Netlify Environment Variables

1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Update:
   - `GOOGLE_CLIENT_ID` = Your new Client ID
   - `GOOGLE_CLIENT_SECRET` = Your new Client Secret
5. Save and redeploy

## Step 4: Restart Your Local Server

After updating `.env.local`:
1. Stop the dev server (Ctrl+C)
2. Restart it: `npm run dev`

## Important Notes

- **Redirect URIs must match exactly** (including `http://` vs `https://`)
- **No trailing slashes** in redirect URIs
- If you add a custom domain later, add its redirect URI too
- Keep your Client Secret secure - never commit it to Git

## Testing

After setup:
1. Try signing in with Google on http://localhost:3000
2. Try signing in on your Netlify deployment
3. Both should work now!

