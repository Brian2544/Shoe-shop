# Pre-Push to GitHub Checklist ✅

Use this checklist before pushing your code to GitHub to ensure all secrets are protected.

## 🔒 Security Verification

### 1. Environment Files
- [x] `.env` files are in `.gitignore` ✅ Verified
- [x] `.env.example` files exist for both frontend and backend ✅
- [ ] Verify no `.env` files are staged: `git status | grep .env`
- [ ] Confirm `.env.example` files only contain placeholders

### 2. Code Review
- [x] No hardcoded API keys in code ✅
- [x] No hardcoded secrets in code ✅
- [x] All sensitive data uses environment variables ✅
- [ ] Review recent changes: `git diff`

### 3. Git Status Check
Run this command:
```bash
git status
```

Verify:
- [ ] No `.env` files appear
- [ ] No files with `.key`, `.pem`, `.cert` extensions
- [ ] No `secrets/` or `credentials/` directories

### 4. Quick Secret Scan
Run these commands to check for exposed secrets:
```bash
# Check for Stripe keys
grep -r "sk_live\|sk_test" --exclude-dir=node_modules --exclude="*.example" .

# Check for hardcoded Supabase URLs with keys
grep -r "SUPABASE.*=.*http" --exclude-dir=node_modules --exclude="*.example" .

# Check for passwords
grep -r "password.*=.*['\"].*['\"]" --exclude-dir=node_modules --exclude="*.example" .
```

## 📋 Files That Should Be Committed

✅ **Safe to commit:**
- `.env.example` files (with placeholders)
- `SECURITY.md`
- `.gitignore`
- All source code files
- Documentation files

❌ **Never commit:**
- `.env` files
- `.env.local` files
- Any file containing real API keys
- Credentials or secrets

## 🚀 Ready to Push?

Once all checks pass:
```bash
# Add files (excluding .env)
git add .

# Verify what will be committed
git status

# Commit
git commit -m "Your commit message"

# Push
git push origin main
```

## 🆘 If You Find Exposed Secrets

1. **STOP** - Do not commit
2. Remove the secret from the file
3. Rotate/regenerate the exposed key immediately
4. Update the code to use environment variables
5. Verify `.gitignore` includes the file type

## 📚 Additional Resources

- See `SECURITY.md` for detailed security guidelines
- See `.github/SECURITY_CHECKLIST.md` for pre-commit checks
