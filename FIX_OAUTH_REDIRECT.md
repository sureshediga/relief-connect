# Fix OAuth Redirect URI Mismatch Error

## The Problem
Error: `redirect_uri_mismatch` means the redirect URI in Google Cloud Console doesn't match what your app is sending.

## The Solution

### Step 1: Check What Redirect URI Your App Is Using

Your app uses this format:
- **Local**: `http://localhost:3000/api/auth/callback/google`
- **Netlify**: `https://superb-cactus-77d812.netlify.app/api/auth/callback/google`

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, make sure you have **EXACTLY** these (no trailing slashes):

   ```
   http://localhost:3000/api/auth/callback/google
   https://superb-cactus-77d812.netlify.app/api/auth/callback/google
   ```

6. **Important**: 
   - No trailing slashes (`/` at the end)
   - Use `http://` for localhost (not `https://`)
   - Use `https://` for Netlify
   - The path must be exactly `/api/auth/callback/google`

7. Click **Save**

### Step 3: Wait a Few Minutes

Google OAuth changes can take 1-5 minutes to propagate.

### Step 4: Test Again

1. Try signing in with Google on http://localhost:3000
2. If it still doesn't work, check the browser console for the exact redirect URI being used

## Common Mistakes

❌ **Wrong**: `http://localhost:3000/api/auth/callback/google/` (trailing slash)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

❌ **Wrong**: `https://localhost:3000/api/auth/callback/google` (https for localhost)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

❌ **Wrong**: `http://localhost:3000/auth/callback/google` (wrong path)
✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

## Debug: Check What URI Is Being Sent

If you want to see what redirect URI your app is actually sending:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign in with Google
4. Look for the request to `accounts.google.com`
5. Check the `redirect_uri` parameter in the URL

That's the exact URI you need to add to Google Cloud Console.

