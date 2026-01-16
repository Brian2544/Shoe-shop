# Security Guidelines

## 🔒 Protecting Your Secrets

This document outlines security best practices for this project.

## ⚠️ CRITICAL: Never Commit Secrets

**NEVER** commit the following to version control:
- `.env` files
- API keys
- Passwords
- Tokens
- Private keys
- Service role keys
- Any credentials

## ✅ What's Protected

The following files are automatically ignored by Git (see `.gitignore`):
- `.env` and all `.env.*` files
- `*.key`, `*.pem`, `*.cert` files
- `secrets/` and `credentials/` directories
- All environment variable files

## 📋 Environment Variables

### Frontend (`frontend/.env`)
All frontend environment variables must be prefixed with `VITE_` to be accessible in the browser.

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key (safe for frontend)

**Optional:**
- `VITE_API_URL` - Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (safe for frontend)

### Backend (`backend/.env`)
Backend environment variables are server-side only and should NEVER be exposed to the frontend.

**Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **KEEP SECRET** - Bypasses Row Level Security
- `SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `STRIPE_SECRET_KEY` - ⚠️ **KEEP SECRET**
- `PAYPAL_CLIENT_SECRET` - ⚠️ **KEEP SECRET**
- `TWILIO_AUTH_TOKEN` - ⚠️ **KEEP SECRET**
- `EMAIL_PASS` - ⚠️ **KEEP SECRET**
- `JWT_SECRET` - ⚠️ **KEEP SECRET**

## 🛡️ Security Best Practices

### 1. Use `.env.example` Files
- `.env.example` files are committed to show what variables are needed
- They contain placeholder values, never real secrets
- Copy `.env.example` to `.env` and fill in real values locally

### 2. Service Role Key Security
The `SUPABASE_SERVICE_ROLE_KEY` is extremely sensitive:
- **Never** expose it to the frontend
- **Never** commit it to Git
- **Never** log it in console
- Only use it server-side in the backend

### 3. API Keys in Frontend
Only use **publishable** keys in the frontend:
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_`)
- ✅ `VITE_SUPABASE_ANON_KEY` (public key)
- ❌ Never use secret keys (starting with `sk_`) in frontend

### 4. Environment-Specific Configuration
- Development: Use `.env.local` for local overrides
- Production: Set environment variables in your hosting platform (Vercel, Heroku, etc.)
- Never hardcode secrets in code

### 5. Code Review Checklist
Before pushing to GitHub, verify:
- [ ] No `.env` files are staged
- [ ] No hardcoded API keys or secrets
- [ ] No credentials in comments
- [ ] `.env.example` files exist and are up to date
- [ ] All sensitive data uses environment variables

## 🔍 Checking for Exposed Secrets

### Before Committing
```bash
# Check for common secret patterns
grep -r "sk_live\|sk_test\|SUPABASE.*=.*http" --exclude-dir=node_modules .
grep -r "password.*=.*['\"].*['\"]" --exclude-dir=node_modules .
```

### If You Accidentally Committed Secrets
1. **Immediately** rotate/regenerate the exposed keys
2. Remove the secret from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (⚠️ coordinate with team first)
4. Update all services using the exposed keys

## 📚 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** create a public issue
2. Contact the project maintainer privately
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure
