# Pre-Commit Security Checklist

Before pushing to GitHub, verify the following:

## ✅ Environment Files
- [ ] `.env` files are NOT staged (check with `git status`)
- [ ] `.env.example` files exist and are up to date
- [ ] No real secrets in `.env.example` files (only placeholders)

## ✅ Code Review
- [ ] No hardcoded API keys or secrets in code
- [ ] No credentials in comments
- [ ] No passwords or tokens in configuration files
- [ ] All sensitive data uses environment variables

## ✅ Git Status Check
Run before committing:
```bash
git status
```

Verify that:
- No `.env` files appear in the staging area
- No files with `.key`, `.pem`, `.cert` extensions
- No `secrets/` or `credentials/` directories

## ✅ Secret Patterns Check
Search for common secret patterns:
```bash
# Check for exposed keys (run from project root)
grep -r "sk_live\|sk_test" --exclude-dir=node_modules --exclude="*.example" .
grep -r "SUPABASE.*=.*http" --exclude-dir=node_modules --exclude="*.example" .
```

If any matches are found, ensure they are:
- In `.env.example` files (with placeholder values)
- In documentation (with placeholder values)
- NOT in actual code or `.env` files

## 🚨 If Secrets Are Found
1. **DO NOT COMMIT**
2. Remove the secret from the file
3. Rotate/regenerate the exposed key immediately
4. Use environment variables instead

## 📝 Quick Verification Commands

```bash
# Check what will be committed
git diff --cached

# Check for .env files
find . -name ".env" -not -path "*/node_modules/*"

# Verify .gitignore is working
git status --ignored | grep .env
```
