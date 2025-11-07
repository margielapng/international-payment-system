# Quick Start Guide 🚀

Get the International Payment System running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 20.x installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Git installed

## Step 1: Clone & Install (2 minutes)

\`\`\`bash
# Clone the repository
git clone https://github.com/margielapng/international-payment-system.git
cd international-payment-system

# Install dependencies
npm install
\`\`\`

## Step 2: Environment Setup (2 minutes)

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Service Role key → `SUPABASE_SERVICE_ROLE_KEY`

3. Generate secrets (run these commands):
\`\`\`bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Key (must be exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# CSRF Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

4. Update `.env.local` with your values

## Step 3: Database Setup (1 minute)

1. Go to Supabase Dashboard → SQL Editor
2. Run scripts in order:
   \`\`\`sql
   -- Copy and paste from scripts/001_create_tables.sql
   -- Then: scripts/002_create_rls_policies.sql
   -- Then: scripts/003_create_triggers.sql
   -- Finally: scripts/004_seed_employees.sql
   \`\`\`

## Step 4: Run the Application

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Default Employee Credentials

After running `004_seed_employees.sql`:

**Admin:**
- Email: `admin@payment-system.com`
- Password: `AdminPass123!`
- Employee ID: `EMP001`

**Manager:**
- Email: `manager@payment-system.com`
- Password: `ManagerPass123!`
- Employee ID: `EMP002`

**Employee:**
- Email: `employee@payment-system.com`
- Password: `EmployeePass123!`
- Employee ID: `EMP003`

## Test the System

### Customer Flow:
1. Go to `http://localhost:3000`
2. Click "Register" → Create account
3. Check email for verification link
4. Login → Setup MFA (optional)
5. Create a test transaction

### Employee Flow:
1. Go to `http://localhost:3000/employee/login`
2. Login with admin credentials above
3. View pending transactions
4. Verify or reject transactions

## Next Steps

- [ ] Change default employee passwords
- [ ] Configure email settings in Supabase
- [ ] Set up CircleCI for CI/CD
- [ ] Configure SonarCloud for code quality
- [ ] Deploy to Vercel

## Troubleshooting

**"Cannot connect to database"**
→ Check Supabase URL and keys in `.env.local`

**"Invalid JWT secret"**
→ Ensure secrets are at least 32 characters

**"Email not sending"**
→ Configure SMTP in Supabase Auth settings

**"Module not found"**
→ Run `npm install` again

## Need Help?

- Check the main [README.md](../README.md)
- See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Open an issue on GitHub

---

**You're all set!** 🎉

The system is now running with:
✅ Customer registration & authentication
✅ Employee portal with verification
✅ MFA/2FA support
✅ All security features enabled
✅ Rate limiting active
✅ Audit logging working
