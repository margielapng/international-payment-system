# Secure International Payments System

A highly secure, enterprise-grade international payment processing platform with separate customer and employee portals, built with React, Node.js, Express, and MongoDB.

## 📋 Overview

This system allows customers to securely submit international payment requests, which are then verified and processed by bank employees through a dedicated verification portal. The application implements comprehensive security measures including JWT authentication, MFA, input validation, audit logging, and more.

## ✨ Features

### Customer Portal
- Secure user registration with email validation
- JWT-based authentication with refresh tokens
- Two-factor authentication (TOTP + backup codes)
- International payment submission with SWIFT support
- Multiple currency support (USD, EUR, GBP, ZAR, JPY)
- Real-time transaction status tracking
- Payment history with filtering

### Employee Portal
- Static account management (no self-registration)
- Pending payment verification dashboard
- Detailed transaction review with validation
- Bulk payment submission to SWIFT
- Payment statistics and analytics
- Comprehensive audit logging

### Admin Features
- Employee account creation and management
- Employee password reset
- Audit log viewing and export
- System activity monitoring
- User activity analysis

### Security Features
- **Password Security**: 12-char minimum with complexity requirements, bcrypt hashing (12 rounds)
- **MFA Support**: TOTP-based 2FA with QR codes and backup codes
- **Input Validation**: Strict regex whitelisting for all inputs
- **Rate Limiting**: Per-endpoint limits to prevent abuse
- **Audit Logging**: Immutable audit trail of all actions
- **HTTP Security Headers**: CSP, X-Frame-Options, HSTS, etc.
- **XSS Protection**: Output escaping and CSP headers
- **CSRF Protection**: SameSite cookies and token validation
- **Session Management**: HTTPOnly secure cookies with short expiry
- **Account Lockout**: 5 failed attempts = 15-minute lockout

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Axios, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Auth**: JWT + Refresh Tokens + TOTP MFA
- **Security**: Helmet, express-rate-limit, bcrypt, speakeasy

### Project Structure
\`\`\`
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, security
│   │   ├── utils/           # JWT, Password, MFA, Audit
│   │   ├── config/          # Security config
│   │   └── server.ts        # Express app
│   ├── tests/               # Unit/integration tests
│   ├── Dockerfile           # Production build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS
│   │   ├── utils/           # API client, validation
│   │   └── App.tsx
│   ├── Dockerfile           # Nginx container
│   └── package.json
├── .circleci/
│   └── config.yml           # CI/CD pipeline
├── docker-compose.yml       # Local development
└── SECURITY.md              # Security documentation
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/secure-payments.git
cd secure-payments
\`\`\`

2. **Setup environment variables**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. **Start MongoDB**
\`\`\`bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin mongo:6.0
\`\`\`

4. **Setup backend**
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

5. **Setup frontend** (new terminal)
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

Visit `http://localhost:3000` and log in with your created account.

### Docker Compose

\`\`\`bash
docker-compose up
\`\`\`

This starts MongoDB, backend, and frontend services.

## 📖 API Documentation

### Authentication Endpoints

**Register Customer**
\`\`\`
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "accountNumber": "ZA1234567890",
  "password": "SecurePass123!@#",
  "confirmPassword": "SecurePass123!@#",
  "fullName": "John Doe",
  "idNumber": "9001015001087"
}
\`\`\`

**Login**
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "accountNumber": "ZA1234567890",
  "password": "SecurePass123!@#",
  "mfaToken": "123456" // Optional if MFA enabled
}
\`\`\`

**Setup MFA**
\`\`\`
POST /api/auth/mfa/setup
Authorization: Bearer {accessToken}
\`\`\`

Response includes QR code and backup codes.

**Verify MFA**
\`\`\`
POST /api/auth/mfa/verify
Authorization: Bearer {accessToken}

{
  "secret": "BASE32_SECRET",
  "mfaToken": "123456",
  "backupCodes": ["code1", "code2", ...]
}
\`\`\`

### Payment Endpoints

**Create Payment**
\`\`\`
POST /api/payments
Authorization: Bearer {accessToken}

{
  "amount": 1000.50,
  "currency": "USD",
  "provider": "SWIFT",
  "payeeFullName": "Jane Smith",
  "payeeAccountNumber": "GB82WEST12345698765432",
  "payeeSwiftCode": "DEUTDEFF"
}
\`\`\`

**Get Customer Payments**
\`\`\`
GET /api/payments?page=1&limit=20&status=pending
Authorization: Bearer {accessToken}
\`\`\`

**Get Pending Payments (Employee)**
\`\`\`
GET /api/payments/pending
Authorization: Bearer {accessToken}
\`\`\`

**Verify Payment (Employee)**
\`\`\`
POST /api/payments/{paymentId}/verify
Authorization: Bearer {accessToken}

{
  "verified": true
}
\`\`\`

Or reject:
\`\`\`json
{
  "verified": false,
  "rejectionReason": "Account number invalid"
}
\`\`\`

**Submit to SWIFT**
\`\`\`
POST /api/payments/swift/submit
Authorization: Bearer {accessToken}

{
  "paymentIds": ["id1", "id2", "id3"]
}
\`\`\`

## 🧪 Testing

### Run Tests
\`\`\`bash
cd backend
npm test
\`\`\`

### Coverage Report
\`\`\`bash
npm test -- --coverage
\`\`\`

## 🔒 Security Considerations

See [SECURITY.md](./SECURITY.md) for comprehensive security documentation including:
- Authentication & authorization
- Input validation & sanitization
- Attack prevention measures
- Compliance requirements
- Deployment checklist

## 📊 Audit Logging

All critical actions are logged including:
- User registration and login attempts
- MFA setup and verification
- Payment creation, verification, and submission
- Employee account management
- Failed security checks

View audit logs at `/api/audit` (admin/employee only).

## 🚢 Production Deployment

### Docker
\`\`\`bash
docker build -t secure-payments-backend:latest backend/
docker build -t secure-payments-frontend:latest frontend/
\`\`\`

### Environment Configuration
\`\`\`bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
REFRESH_TOKEN_SECRET=<strong-random-secret>
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/secure-payments
CORS_ORIGIN=https://yourdomain.com
\`\`\`

### SSL/TLS
- Use Let's Encrypt certificates
- Auto-renew via certbot
- Enforce HTTPS redirect

### Monitoring
- Application performance monitoring
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Uptime monitoring

## 📝 Changelog

### v1.0.0 (2024-11-06)
- Initial release
- Complete customer and employee portals
- JWT authentication with MFA
- Payment processing and verification
- Comprehensive audit logging
- DevSecOps pipeline with CircleCI

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For security issues, email security@example.com
For general support, create an issue on GitHub

## ⚠️ Disclaimer

This system handles sensitive financial data. Before production deployment:
- Conduct a security audit
- Perform penetration testing
- Ensure compliance with local financial regulations
- Set up comprehensive monitoring and alerting
