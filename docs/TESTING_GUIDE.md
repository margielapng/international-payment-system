# Testing Guide

Comprehensive guide for running and understanding all tests in the International Payment System.

## Test Structure

\`\`\`
__tests__/
├── lib/
│   └── security/
│       ├── password.test.ts       # Password hashing and validation
│       ├── validation.test.ts     # Input validation and sanitization
│       ├── jwt.test.ts           # JWT token generation and verification
│       └── mfa.test.ts           # Multi-factor authentication
├── api/
│   ├── auth/
│   │   └── register.test.ts      # Registration endpoint
│   └── transactions/
│       └── route.test.ts         # Transaction endpoints
├── security/
│   └── headers.test.ts           # Security headers verification
└── e2e/
    ├── customer-flow.test.ts     # Customer journey
    └── employee-flow.test.ts     # Employee verification flow
\`\`\`

## Running Tests

### Run All Tests
\`\`\`bash
npm test
\`\`\`

### Run Specific Test Suite
\`\`\`bash
# Security tests
npm test -- password.test.ts
npm test -- validation.test.ts
npm test -- jwt.test.ts
npm test -- mfa.test.ts

# API tests
npm test -- register.test.ts
npm test -- route.test.ts

# E2E tests
npm test -- e2e
\`\`\`

### Run Tests in Watch Mode
\`\`\`bash
npm test -- --watch
\`\`\`

### Run Tests with Coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

### Coverage Report
After running with coverage, open:
\`\`\`
coverage/lcov-report/index.html
\`\`\`

## Test Categories

### 1. Unit Tests

#### Password Security Tests
**File**: `__tests__/lib/security/password.test.ts`

**What it tests:**
- Password hashing with bcrypt
- Password verification
- Password strength validation
- Salt uniqueness

**Key assertions:**
- Passwords are hashed correctly
- Same password produces different hashes (salt)
- Strong passwords are accepted
- Weak passwords are rejected
- All password requirements enforced

#### Input Validation Tests
**File**: `__tests__/lib/security/validation.test.ts`

**What it tests:**
- Email validation with RegEx
- Name validation (letters, spaces, hyphens, apostrophes)
- Phone number validation (international format)
- Amount validation (positive, max 2 decimals)
- Account number validation (8-16 digits)
- SWIFT code validation (8 or 11 characters)
- IBAN validation (country code + alphanumeric)
- Input sanitization (HTML removal)
- XSS prevention (HTML encoding)

**Key assertions:**
- Valid inputs are accepted
- Invalid inputs are rejected
- SQL injection attempts are blocked
- XSS attempts are sanitized
- All RegEx patterns work correctly

#### JWT Security Tests
**File**: `__tests__/lib/security/jwt.test.ts`

**What it tests:**
- Access token generation
- Refresh token generation
- Token verification
- Token expiration
- Payload extraction

**Key assertions:**
- Tokens are generated in correct format
- Tokens contain correct payload
- Invalid tokens are rejected
- Expired tokens are rejected

#### MFA Tests
**File**: `__tests__/lib/security/mfa.test.ts`

**What it tests:**
- MFA secret generation
- Backup code generation
- TOTP token verification
- QR code URL generation

**Key assertions:**
- Secrets are unique and valid
- 10 backup codes generated
- Backup codes are unique
- QR code URLs are properly formatted

### 2. Integration Tests

#### Registration API Tests
**File**: `__tests__/api/auth/register.test.ts`

**What it tests:**
- User registration with valid data
- Password strength enforcement
- Email validation
- SQL injection prevention
- XSS attack prevention

**Key assertions:**
- Valid registration succeeds (201)
- Weak passwords rejected (400)
- Invalid emails rejected (400)
- SQL injection attempts blocked (400)
- XSS attempts sanitized (400)

#### Transaction API Tests
**File**: `__tests__/api/transactions/route.test.ts`

**What it tests:**
- Transaction creation with valid data
- Amount validation
- SWIFT code validation
- IBAN validation
- Authentication requirement

**Key assertions:**
- Valid transactions created (200/201)
- Invalid amounts rejected (400)
- Invalid SWIFT codes rejected (400)
- Invalid IBANs rejected (400)
- Unauthenticated requests rejected (401)

### 3. Security Tests

#### Security Headers Tests
**File**: `__tests__/security/headers.test.ts`

**What it tests:**
- Content-Security-Policy header
- X-Frame-Options header
- X-Content-Type-Options header
- Strict-Transport-Security header
- X-XSS-Protection header
- Referrer-Policy header
- Permissions-Policy header

**Key assertions:**
- All security headers present
- Headers have correct values
- CSP prevents XSS
- X-Frame-Options prevents clickjacking
- HSTS enforces HTTPS

### 4. End-to-End Tests

#### Customer Flow Tests
**File**: `__tests__/e2e/customer-flow.test.ts`

**What it tests:**
- Complete customer journey
- Registration → Login → Transaction → History

**Steps verified:**
1. Navigate to registration
2. Fill and submit form
3. Verify email confirmation
4. Login with credentials
5. Navigate to dashboard
6. Create new transaction
7. View transaction history
8. Verify transaction status

#### Employee Flow Tests
**File**: `__tests__/e2e/employee-flow.test.ts`

**What it tests:**
- Complete employee verification journey
- Login → Review → Approve → Audit

**Steps verified:**
1. Navigate to employee login
2. Login with credentials
3. View pending transactions
4. Review transaction details
5. Approve transaction
6. Verify status update
7. Check audit log entry

## Test Coverage Goals

### Minimum Coverage Requirements
- **Overall**: 80%
- **Security modules**: 95%
- **API routes**: 85%
- **Validation functions**: 100%

### Current Coverage
Run `npm test -- --coverage` to see current coverage.

## Writing New Tests

### Test Template
\`\`\`typescript
import { functionToTest } from '@/lib/module'

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something with valid input', () => {
      const result = functionToTest('valid-input')
      expect(result).toBe(expectedValue)
    })

    it('should reject invalid input', () => {
      const result = functionToTest('invalid-input')
      expect(result).toBe(null)
    })
  })
})
\`\`\`

### Best Practices
1. **Test one thing per test**: Each test should verify one specific behavior
2. **Use descriptive names**: Test names should explain what they verify
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Test edge cases**: Include boundary conditions
5. **Test error cases**: Verify error handling
6. **Mock external dependencies**: Use mocks for database, APIs
7. **Keep tests independent**: Tests should not depend on each other

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Every push to main branch
- Every pull request
- Scheduled daily runs

### CircleCI
Tests run as part of the CI/CD pipeline:
1. Install dependencies
2. Run linter
3. Run tests with coverage
4. Run security audit
5. Run SonarQube scan
6. Build Docker image

### SonarQube
Code quality checks:
- Code coverage
- Code smells
- Security hotspots
- Bugs and vulnerabilities
- Technical debt

## Troubleshooting

### Tests Failing Locally

**Issue**: Tests pass in CI but fail locally
**Solution**: 
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
\`\`\`

**Issue**: Database connection errors
**Solution**: Check environment variables are set correctly

**Issue**: Timeout errors
**Solution**: Increase timeout in jest.config.json:
\`\`\`json
{
  "testTimeout": 10000
}
\`\`\`

### Mock Issues

**Issue**: Supabase client not mocked
**Solution**: Add mock in `jest.setup.js`:
\`\`\`javascript
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn()
}))
\`\`\`

## Security Testing Checklist

- [ ] Password hashing tested
- [ ] Password strength validation tested
- [ ] Input validation for all fields tested
- [ ] SQL injection prevention tested
- [ ] XSS prevention tested
- [ ] CSRF protection tested
- [ ] Rate limiting tested
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Session management tested
- [ ] Security headers tested
- [ ] Encryption tested
- [ ] Audit logging tested

## Performance Testing

### Load Testing
Use the provided k6 script:
\`\`\`bash
k6 run tests/load/api-load-test.js
\`\`\`

### Metrics to Monitor
- Response time (< 200ms)
- Throughput (requests/second)
- Error rate (< 1%)
- Database query time
- Memory usage

---

**Happy Testing!** ✅
