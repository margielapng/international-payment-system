# Security Audit Checklist ✅

Use this checklist to verify all security features are properly implemented and working.

## 🔐 Password Security [10/80 Marks]

- [ ] **Bcrypt hashing implemented** (12 rounds)
  - Test: Check `lib/security/password.ts` for `SALT_ROUNDS = 12`
  - Verify: Hash a password and check it starts with `$2a$12$`
  
- [ ] **Password requirements enforced**
  - [ ] Minimum 12 characters
  - [ ] At least one uppercase letter
  - [ ] At least one lowercase letter
  - [ ] At least one number
  - [ ] At least one special character (@$!%*?&)
  - Test: Try registering with weak passwords

- [ ] **Password validation before hashing**
  - Test: Submit invalid passwords and verify error messages

- [ ] **Account lockout after failed attempts**
  - Test: Try 5 wrong passwords → Account should lock for 30 minutes

## 🛡️ Input Whitelisting [10/80 Marks]

- [ ] **Email validation** (RFC 5322 compliant)
  - Pattern: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
  - Test: `test@example.com` ✅ | `test@` ❌

- [ ] **Name validation** (alphabetic with special chars)
  - Pattern: `/^[a-zA-Z\s\-']{2,50}$/`
  - Test: `John O'Brien` ✅ | `John<script>` ❌

- [ ] **Phone validation** (international format)
  - Pattern: `/^\+?[1-9]\d{1,14}$/`
  - Test: `+12345678900` ✅ | `123` ❌

- [ ] **Amount validation** (decimal, max 1M)
  - Pattern: `/^\d+(\.\d{1,2})?$/` + range check
  - Test: `1000.50` ✅ | `1000000.001` ❌

- [ ] **SWIFT code validation**
  - Pattern: `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/`
  - Test: `ABCDGB2LXXX` ✅ | `ABC123` ❌

- [ ] **IBAN validation**
  - Pattern: `/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/`
  - Test: `GB82WEST12345698765432` ✅ | `123` ❌

- [ ] **XSS sanitization**
  - Test: Submit `<script>alert('XSS')</script>` → Should be sanitized

- [ ] **SQL injection protection**
  - Test: Submit `' OR '1'='1` in login → Should be rejected

## 🔒 SSL/TLS Security [20/80 Marks]

- [ ] **HTTPS enforced in production**
  - Check: Production URL starts with `https://`
  
- [ ] **Strict-Transport-Security header**
  - Header: `max-age=31536000; includeSubDomains; preload`
  - Test: Check Network tab in DevTools

- [ ] **TLS 1.2+ only**
  - Test: Use SSL Labs (ssllabs.com/ssltest)

- [ ] **Valid SSL certificate**
  - Check: No browser warnings on production

- [ ] **Secure cookie flags**
  - [ ] `httpOnly: true`
  - [ ] `secure: true` (production)
  - [ ] `sameSite: 'strict'`
  - Test: Check Application → Cookies in DevTools

- [ ] **HTTP redirects to HTTPS**
  - Test: Try `http://your-domain.com` → Should redirect to HTTPS

## 🛡️ Attack Protection [30/80 Marks]

### SQL Injection
- [ ] **Parameterized queries used**
  - Check: All Supabase queries use `.eq()`, `.select()` methods
  - Test: Try `' OR '1'='1` in inputs

### XSS (Cross-Site Scripting)
- [ ] **Input sanitization**
  - Test: `<script>alert('XSS')</script>` in forms
- [ ] **Output encoding**
  - Check: User data displayed doesn't execute scripts
- [ ] **Content-Security-Policy header**
  - Header present in responses

### CSRF (Cross-Site Request Forgery)
- [ ] **CSRF tokens implemented**
  - Check: `/api/csrf` endpoint exists
- [ ] **SameSite cookies**
  - Check: Cookies have `sameSite: 'strict'`

### Clickjacking
- [ ] **X-Frame-Options: DENY**
  - Test: Try embedding site in iframe → Should fail

### Session Hijacking
- [ ] **HTTP-only cookies**
  - Check: Cannot access tokens via `document.cookie`
- [ ] **Short-lived access tokens** (15 min)
- [ ] **Refresh token rotation**
  - Test: Refresh endpoint invalidates old tokens

### MITM (Man-in-the-Middle)
- [ ] **HSTS header**
  - Forces HTTPS for all requests
- [ ] **TLS certificate valid**

### Brute Force
- [ ] **Rate limiting on login** (10/15min)
  - Test: Try 10 login attempts rapidly → Should block
- [ ] **Rate limiting on registration** (5/hour)
- [ ] **Account lockout**

### Directory Traversal
- [ ] **Input whitelisting**
  - Test: `../../../etc/passwd` in inputs → Should reject

### HTTP Parameter Pollution
- [ ] **Input validation**
  - Test: Duplicate parameters → Should handle correctly

## 🔄 DevSecOps Pipeline [10/80 Marks]

- [ ] **CircleCI configured**
  - File: `.circleci/config.yml` exists
  
- [ ] **Automated testing**
  - [ ] Unit tests run
  - [ ] Integration tests run
  - [ ] Coverage > 70%

- [ ] **Linting**
  - [ ] ESLint configured
  - [ ] TypeScript checking

- [ ] **Security auditing**
  - [ ] npm audit runs
  - [ ] Snyk scan configured

- [ ] **SonarQube integration**
  - [ ] SonarCloud connected
  - [ ] Quality gates configured

- [ ] **Automated deployment**
  - [ ] Deploys on main branch
  - [ ] Environment variables set

- [ ] **Nightly security scans**
  - Cron job at 2 AM UTC

## 🔑 Additional Security Features

### Multi-Factor Authentication
- [ ] **MFA setup available**
  - Navigate to `/customer/settings/mfa`
- [ ] **QR code generation**
  - Uses OTPAuth library
- [ ] **6-digit TOTP codes**
- [ ] **Backup codes generated** (10 codes)
- [ ] **MFA secrets encrypted**
  - Uses AES-256-GCM

### JWT Implementation
- [ ] **Access token expiry** (15 min)
- [ ] **Refresh token expiry** (7 days)
- [ ] **Token signature verification**
- [ ] **Issuer/audience validation**

### Encryption
- [ ] **AES-256-GCM used**
- [ ] **Sensitive data encrypted**
  - MFA secrets
  - Backup codes
- [ ] **Unique IV per encryption**

### Audit Logging
- [ ] **All actions logged**
  - Login/logout
  - Transaction creation
  - Transaction verification
  - Failed attempts
- [ ] **Logs include**
  - User ID
  - Action type
  - Timestamp
  - IP address
  - User agent
  - Status (success/failure)

### Employee Portal
- [ ] **Separate authentication**
  - No public registration
- [ ] **JWT with HTTP-only cookies**
- [ ] **Role-based access**
  - Admin can create employees
  - Employees can verify transactions
- [ ] **Account lockout**

## 📋 Testing Checklist

### Unit Tests
- [ ] `npm run test:unit` passes
- [ ] Password hashing tests
- [ ] JWT generation tests
- [ ] MFA tests
- [ ] Validation tests

### Integration Tests
- [ ] `npm run test:integration` passes
- [ ] Registration endpoint tests
- [ ] Login endpoint tests
- [ ] Transaction endpoint tests

### Security Tests
- [ ] SQL injection tests
- [ ] XSS tests
- [ ] CSRF tests
- [ ] Rate limiting tests

### Coverage
- [ ] `npm run test:coverage` > 70%

## 🚀 Deployment Checklist

### Vercel
- [ ] Project deployed
- [ ] Custom domain (optional)
- [ ] Environment variables set
- [ ] SSL certificate active

### Environment Variables
- [ ] `JWT_SECRET` (32+ chars)
- [ ] `JWT_REFRESH_SECRET` (32+ chars)
- [ ] `ENCRYPTION_KEY` (32 chars exactly)
- [ ] `CSRF_SECRET` (32+ chars)
- [ ] All Supabase variables

### Database
- [ ] Tables created
- [ ] RLS policies enabled
- [ ] Triggers active
- [ ] Seed data loaded

## 📊 Score Estimation

### Task 2 (80 Marks)

| Criterion | Max | Status | Notes |
|-----------|-----|--------|-------|
| Password Security | 10 | ☐ | Bcrypt, strength validation, lockout |
| Input Whitelisting | 10 | ☐ | RegEx for all inputs, XSS protection |
| SSL/TLS | 20 | ☐ | HTTPS, HSTS, secure cookies |
| Attack Protection | 30 | ☐ | SQL injection, XSS, CSRF, etc. |
| DevSecOps Pipeline | 10 | ☐ | CircleCI, SonarQube, tests |

### Task 3 (80 Marks)

| Criterion | Max | Status | Notes |
|-----------|-----|--------|-------|
| Password Security | 20 | ☐ | Enhanced with MFA |
| DevSecOps Pipeline | 30 | ☐ | Complete CI/CD |
| Static Login | 10 | ☐ | Employee portal |
| Overall Functioning | 20 | ☐ | Complete system |

## 🎯 Testing Commands

\`\`\`bash
# Start dev server
npm run dev

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Security audit
npm run security:audit

# Lint code
npm run lint

# Type check
npm run type-check
\`\`\`

## 🔍 Manual Testing Steps

### 1. Customer Registration
\`\`\`
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form with valid data
4. Submit → Should succeed
5. Try weak password → Should fail with specific errors
6. Try invalid email → Should fail
\`\`\`

### 2. MFA Setup
\`\`\`
1. Login as customer
2. Navigate to /customer/settings/mfa
3. Scan QR code with Google Authenticator
4. Save backup codes
5. Enter 6-digit code
6. Verify MFA enabled
\`\`\`

### 3. Create Transaction
\`\`\`
1. Go to /customer/transactions/new
2. Fill all fields
3. Try invalid SWIFT code → Should fail
4. Submit with valid data → Should succeed
5. Check transaction status → Should be "pending"
\`\`\`

### 4. Employee Verification
\`\`\`
1. Logout from customer
2. Go to /employee/login
3. Login with: admin@payment-system.com / AdminPass123!
4. View pending transactions
5. Click "Verify" on transaction
6. Check audit logs
\`\`\`

### 5. Security Headers
\`\`\`
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Click any request
5. Go to Headers
6. Verify all security headers present
\`\`\`

### 6. Rate Limiting
\`\`\`
1. Go to login page
2. Try wrong password 10 times
3. 11th attempt should be blocked
4. Wait 15 minutes or reset rate limiter
\`\`\`

## ✅ Final Verification

Before submission:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Code coverage > 70%
- [ ] No security warnings in npm audit
- [ ] SonarQube scan passed
- [ ] Application deployed to Vercel
- [ ] Video demo recorded and uploaded
- [ ] README updated with team names and video link
- [ ] All environment variables documented
- [ ] Database scripts tested

---

**Status:** ☐ Not Started | ⏳ In Progress | ✅ Complete | ❌ Failed

**Overall Completion:** ___% (Target: 100%)
