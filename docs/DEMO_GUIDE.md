# Demo Video Recording Guide

This guide provides step-by-step instructions for recording a comprehensive 5-minute demo video showcasing all features and security implementations of the International Payment System.

## Recording Setup

### Tools Needed
- **OBS Studio** (recommended) or any screen recording software
- **Microphone** for narration
- **Browser** with the application running locally or deployed

### OBS Studio Settings
\`\`\`
Resolution: 1920x1080 (1080p)
Frame Rate: 30 FPS
Bitrate: 2500-5000 Kbps
Audio: 128-192 Kbps
Format: MP4
\`\`\`

## Demo Script (5 Minutes)

### Introduction (30 seconds)
**What to show:**
- Landing page with security features highlighted
- Brief overview of the system

**What to say:**
> "Welcome to the International Payment System demo. This is a secure, full-stack payment platform built with Next.js, React, and Supabase. The system features enterprise-grade security including SSL/TLS encryption, multi-factor authentication, comprehensive input validation, and protection against all major web attacks. Let me walk you through the key features."

---

### Part 1: Customer Portal (2 minutes)

#### 1.1 Registration (30 seconds)
**What to show:**
- Navigate to registration page
- Fill in the form with valid data:
  - Email: `demo.customer@example.com`
  - Password: `SecurePass123!@#`
  - Full Name: `John Doe`
  - Phone: `+1234567890`
  - Address: `123 Main Street, New York, NY 10001`
- Submit registration
- Show success message

**What to say:**
> "First, let's register a new customer account. Notice the password requirements - we enforce strong passwords with at least 12 characters, including uppercase, lowercase, numbers, and special characters. All inputs are validated using RegEx patterns to prevent SQL injection and XSS attacks. The password is hashed using bcrypt with 12 rounds of salting before storage."

#### 1.2 Login (20 seconds)
**What to show:**
- Navigate to login page
- Enter credentials
- Submit login
- Show redirect to dashboard

**What to say:**
> "After email verification, customers can log in securely. The system uses Supabase Auth with JWT tokens stored in HTTP-only cookies to prevent XSS attacks."

#### 1.3 Dashboard (20 seconds)
**What to show:**
- Customer dashboard with statistics
- Recent transactions section
- Navigation menu

**What to say:**
> "The customer dashboard provides an overview of account activity, including total transactions, pending payments, and recent activity."

#### 1.4 Create Transaction (50 seconds)
**What to show:**
- Click "New Payment" button
- Fill in transaction form:
  - Recipient Name: `Jane Smith`
  - Recipient Email: `jane.smith@example.com`
  - Recipient Phone: `+9876543210`
  - Bank Name: `International Bank`
  - Account Number: `9876543210`
  - SWIFT Code: `INTLUS33`
  - IBAN: `GB82WEST12345698765432`
  - Amount: `1000.00`
  - Currency: `USD`
  - Purpose: `Business payment for services`
- Submit transaction
- Show success message

**What to say:**
> "Creating an international payment is straightforward. All fields are validated in real-time using comprehensive RegEx patterns. Notice the validation for SWIFT codes, IBAN numbers, and account numbers - these follow international banking standards. The system sanitizes all inputs to prevent injection attacks and encrypts sensitive data before storage."

---

### Part 2: Employee Portal (1.5 minutes)

#### 2.1 Employee Login (20 seconds)
**What to show:**
- Navigate to employee login page (`/employee/login`)
- Enter employee credentials:
  - Email: `admin@payment-system.com`
  - Password: `AdminSecure123!@#`
- Submit login
- Show redirect to employee dashboard

**What to say:**
> "The employee portal uses static login - employees cannot self-register. Accounts are created by administrators only. Employee authentication uses JWT tokens with role-based access control."

#### 2.2 Employee Dashboard (20 seconds)
**What to show:**
- Dashboard with statistics:
  - Pending transactions
  - Verified today
  - Total customers
  - Active alerts
- Quick action buttons

**What to say:**
> "The employee dashboard provides real-time statistics and quick access to verification tasks. Employees can see pending transactions, customer management, and audit logs."

#### 2.3 Transaction Verification (50 seconds)
**What to show:**
- Navigate to transactions page
- Show list of pending transactions
- Click on the transaction created earlier
- Review transaction details in dialog
- Click "Approve" button
- Confirm approval
- Show success message
- Show transaction status updated to "verified"

**What to say:**
> "Employees can review and verify customer transactions. Each transaction shows complete details including sender and recipient information, amount, and purpose. The verification process is logged in the audit trail for compliance. Employees can approve or reject transactions with reasons."

#### 2.4 Audit Logs (20 seconds)
**What to show:**
- Navigate to audit logs page
- Show recent activities:
  - Customer registration
  - Customer login
  - Transaction creation
  - Transaction approval
- Filter by action type

**What to say:**
> "All system activities are logged for security and compliance. The audit log tracks authentication events, transaction activities, and administrative actions with timestamps, IP addresses, and user agents."

---

### Part 3: Security Features (1 minute)

#### 3.1 Security Headers (15 seconds)
**What to show:**
- Open browser DevTools (F12)
- Navigate to Network tab
- Refresh page
- Click on any request
- Show Response Headers:
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy`

**What to say:**
> "The application implements comprehensive security headers. HSTS enforces HTTPS, X-Frame-Options prevents clickjacking, CSP prevents XSS attacks, and X-Content-Type-Options prevents MIME sniffing."

#### 3.2 Input Validation Demo (20 seconds)
**What to show:**
- Go back to transaction form
- Try to enter invalid data:
  - Invalid email: `not-an-email`
  - Invalid SWIFT: `ABC`
  - Invalid amount: `-100`
- Show validation errors in real-time

**What to say:**
> "All inputs are validated using strict RegEx patterns. Invalid data is rejected immediately, preventing malicious input from reaching the server. This protects against SQL injection, XSS, and other injection attacks."

#### 3.3 Rate Limiting (15 seconds)
**What to show:**
- Open a new incognito window
- Navigate to login page
- Attempt multiple failed logins (5-6 times)
- Show rate limit error message

**What to say:**
> "The system implements rate limiting to prevent brute force attacks. After multiple failed login attempts, the account is temporarily locked and the IP is rate-limited."

#### 3.4 DevSecOps Pipeline (10 seconds)
**What to show:**
- Open GitHub repository (or show screenshot)
- Navigate to Actions tab
- Show CI/CD workflows:
  - Build and Test
  - Security Audit
  - SonarQube Scan
  - Docker Build

**What to say:**
> "The project includes a complete DevSecOps pipeline with CircleCI and GitHub Actions. Every commit triggers automated testing, security scanning with SonarQube, dependency audits, and Docker builds."

---

### Conclusion (30 seconds)

**What to show:**
- Navigate back to landing page
- Show README or documentation

**What to say:**
> "This International Payment System demonstrates enterprise-grade security with comprehensive protection against OWASP Top 10 vulnerabilities. Key features include: bcrypt password hashing with 12 rounds, JWT authentication with refresh tokens, multi-factor authentication support, comprehensive input validation with RegEx whitelisting, SSL/TLS encryption, security headers for XSS and clickjacking protection, rate limiting for brute force prevention, complete audit logging, and a full DevSecOps pipeline with automated testing and security scanning. The system is production-ready and follows industry best practices for secure payment processing. Thank you for watching!"

---

## Post-Recording Checklist

- [ ] Video is 5 minutes or less
- [ ] Audio is clear and audible
- [ ] All features demonstrated
- [ ] Security features highlighted
- [ ] No sensitive data exposed (use demo credentials only)
- [ ] Video exported in MP4 format
- [ ] Video uploaded to YouTube as unlisted
- [ ] YouTube link added to submission

## Upload Instructions

### YouTube Upload
1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click "Create" → "Upload videos"
3. Select your video file
4. Set visibility to **"Unlisted"**
5. Add title: "International Payment System - Security Demo"
6. Add description with key features
7. Click "Publish"
8. Copy the video link

### Submission
Include the YouTube link in your project submission:
\`\`\`
Demo Video: https://youtu.be/YOUR_VIDEO_ID
\`\`\`

---

## Troubleshooting

### OBS Recording Issues
- **Black screen**: Disable hardware acceleration in browser
- **Laggy recording**: Lower resolution to 720p or reduce bitrate
- **No audio**: Check audio input device in OBS settings

### Application Issues
- **Database errors**: Ensure Supabase is connected and scripts are run
- **Login fails**: Check environment variables are set
- **Transactions not showing**: Refresh the page or check browser console

### Demo Tips
- **Practice first**: Record a test run to check timing
- **Speak clearly**: Narrate what you're doing and why
- **Show, don't tell**: Demonstrate features visually
- **Highlight security**: Emphasize security features throughout
- **Keep it concise**: Stay within 5-minute limit

---

**Good luck with your demo!** 🎥
