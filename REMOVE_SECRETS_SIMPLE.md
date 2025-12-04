# Remove Secrets from Git History - Simple Guide

## Option 1: Suppress Warning and Continue (Quick)

If you want to continue with `git filter-branch`, set the environment variable to suppress the warning:

```bash
# Windows PowerShell
$env:FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch env.example" --prune-empty --tag-name-filter cat -- --all

# Then re-add env.example with placeholders
git add env.example
git commit -m "Update env.example with placeholder values"

# Force push
git push origin main --force
```

## Option 2: Use GitHub Allow Secret (EASIEST - Recommended)

This is the simplest solution if the secrets in that old commit are no longer valid:

1. **Google OAuth Client ID:**
   - Visit: https://github.com/sureshediga/relief-connect/security/secret-scanning/unblock-secret/36H5T608UXTH5W3wA5CLdV1mdkN
   - Click "Allow secret"

2. **Google OAuth Client Secret:**
   - Visit: https://github.com/sureshediga/relief-connect/security/secret-scanning/unblock-secret/36H5T5aBck2tHRtFrVchknmToYY
   - Click "Allow secret"

3. **Then push normally:**
   ```bash
   git push origin main
   ```

## Option 3: Use git filter-repo (Modern Alternative)

If you want to use the modern tool instead:

1. **Install git-filter-repo:**
   ```bash
   # Windows (using pip)
   pip install git-filter-repo
   ```

2. **Remove env.example from history:**
   ```bash
   git filter-repo --path env.example --invert-paths
   ```

3. **Re-add env.example:**
   ```bash
   git add env.example
   git commit -m "Add env.example with placeholder values"
   ```

4. **Force push:**
   ```bash
   git push origin main --force
   ```

## Recommendation

**Use Option 2 (GitHub Allow Secret)** - It's the quickest and doesn't require rewriting history. Only use Option 1 or 3 if you absolutely need to remove the secrets from history.

