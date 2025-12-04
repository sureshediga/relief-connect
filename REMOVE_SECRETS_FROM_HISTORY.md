# Remove Secrets from Git History

GitHub detected Google OAuth secrets in commit `08a0aef72a561da0b9dcf09f02fb7b78c3a3ffda`. 

## Option 1: Use GitHub's Allow Secret (Quickest)

If the secrets in that commit are no longer valid/used, you can allow them through GitHub:

1. Visit: https://github.com/sureshediga/relief-connect/security/secret-scanning/unblock-secret/36H5T608UXTH5W3wA5CLdV1mdkN
2. Click "Allow secret" for the Google OAuth Client ID
3. Visit: https://github.com/sureshediga/relief-connect/security/secret-scanning/unblock-secret/36H5T5aBck2tHRtFrVchknmToYY
4. Click "Allow secret" for the Google OAuth Client Secret
5. Try pushing again: `git push origin main`

## Option 2: Remove Secrets from Git History (Recommended)

If you want to completely remove the secrets from history:

### Step 1: Remove secrets from env.example in history

```bash
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch env.example" --prune-empty --tag-name-filter cat -- --all
```

### Step 2: Re-add env.example with placeholders

```bash
git add env.example
git commit -m "Add env.example with placeholder values"
```

### Step 3: Force push (WARNING: This rewrites history)

```bash
git push origin main --force
```

**Note:** Force pushing rewrites history. If others are working on this repo, coordinate with them first.

## Option 3: Use BFG Repo-Cleaner (Alternative)

BFG is faster than git filter-branch:

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Create a file with the secrets to remove
3. Run: `java -jar bfg.jar --replace-text secrets.txt`
4. Force push: `git push origin main --force`

## Recommendation

Since the secrets are in an old commit and `env.example` now has placeholders, **Option 1 (Allow Secret)** is the quickest if those secrets are no longer valid. If you want to keep history clean, use **Option 2**.

