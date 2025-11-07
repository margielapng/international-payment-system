# Video Demo Recording Guide 🎥

Complete guide for recording your 5-minute demonstration video.

## Before You Start

### Checklist:
- [ ] Application running locally (`npm run dev`)
- [ ] Database populated with seed data
- [ ] Test customer account created and verified
- [ ] OBS Studio installed
- [ ] Microphone working
- [ ] Browser bookmarks ready for quick navigation

## OBS Studio Setup

### 1. Download & Install
- Download OBS Studio from [obsproject.com](https://obsproject.com)
- Install for your operating system

### 2. Configure Settings

**Video Settings:**
- Resolution: 1920x1080 (1080p)
- FPS: 30
- Encoder: x264 or Hardware (NVENC/QuickSync)
- Bitrate: 2500-5000 Kbps

**Audio Settings:**
- Desktop Audio: Enable (for system sounds)
- Microphone: Enable and test
- Audio Bitrate: 160 Kbps

### 3. Add Sources

1. **Display Capture** (full screen) OR **Window Capture** (browser only)
2. **Audio Input** (your microphone)
3. Optional: **Webcam** (for face cam in corner)

### 4. Test Recording

- Record a 10-second test
- Check audio levels
- Verify video quality
- Adjust as needed

## Recording Script (5 Minutes)

### Introduction (30 seconds)
**Say:** "Hello, I'm [Your Name], and this is our International Payment System. This secure platform handles international transactions with comprehensive security features."

**Show:** Homepage with key features highlighted

### Part 1: Customer Registration & MFA (90 seconds)

**Say:** "First, let me demonstrate the customer registration process with multi-factor authentication."

**Actions:**
1. Click "Register"
2. Fill form with test data:
   - Email: `demo@example.com`
   - Password: `DemoPass123!` (point out requirements)
   - Full name and details
3. Submit → Show "Check your email" message
4. *Skip actual email verification* or show pre-verified account
5. Login with credentials
6. Navigate to MFA setup
7. Show QR code generation
8. Scan with authenticator app (Google Authenticator)
9. Show backup codes
10. Verify with 6-digit code

**Highlight:**
- "Password requires 12+ characters with uppercase, lowercase, numbers, and special characters"
- "Notice the MFA setup with QR code for TOTP authentication"
- "Backup codes are provided for account recovery"

### Part 2: Create International Payment (60 seconds)

**Say:** "Now I'll create an international payment transaction."

**Actions:**
1. Navigate to "New Transaction"
2. Fill out comprehensive form:
   - Sender details (your account)
   - Recipient details (international recipient)
   - Amount: $5,000
   - SWIFT code: ABCDGB2LXXX
   - IBAN: GB82WEST12345698765432
   - Purpose: Business payment
3. Submit transaction
4. Show "Transaction submitted" with pending status
5. View in transaction history

**Highlight:**
- "Input validation with RegEx whitelisting for SWIFT and IBAN codes"
- "All data is sanitized to prevent XSS attacks"
- "Transaction is pending employee verification"

### Part 3: Employee Portal & Verification (90 seconds)

**Say:** "Let me switch to the employee portal to verify this transaction."

**Actions:**
1. Logout from customer portal
2. Navigate to `/employee/login`
3. Login with admin credentials:
   - Email: `admin@payment-system.com`
   - Password: `AdminPass123!`
4. Show employee dashboard with stats
5. Navigate to "Transactions"
6. Find the pending transaction
7. Click "View Details"
8. Click "Verify" → Confirm
9. Show status changes to "verified"
10. Navigate to "Audit Logs"
11. Show logged events

**Highlight:**
- "Separate employee authentication with JWT tokens"
- "Role-based access control - only authorized employees can verify"
- "Complete audit trail of all actions"
- "HTTP-only cookies prevent XSS token theft"

### Part 4: Security Features (60 seconds)

**Say:** "Let me demonstrate the security features in action."

**Actions:**
1. Open browser DevTools (F12)
2. Go to Application → Cookies
   - Point out `httpOnly` flag on tokens
   - Point out `secure` and `sameSite` flags
3. Go to Network tab
4. Refresh page
5. Click on a request → Headers
6. Show security headers:
   - Strict-Transport-Security
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy
7. Attempt failed login (wrong password)
8. Show account lockout after 5 attempts

**Highlight:**
- "All cookies are httpOnly to prevent XSS"
- "Comprehensive security headers protect against clickjacking and MITM attacks"
- "Rate limiting prevents brute force attacks"
- "Account locks after 5 failed attempts"

### Part 5: DevSecOps Pipeline (30 seconds)

**Say:** "Finally, our DevSecOps pipeline ensures code quality and security."

**Actions:**
1. Show GitHub repository
2. Navigate to `.circleci/config.yml`
3. Scroll through pipeline jobs:
   - Linting
   - Unit tests
   - Integration tests
   - Security audit (npm audit, Snyk)
   - SonarQube scan
   - Build & Deploy
4. Show SonarCloud dashboard (if available)

**Highlight:**
- "Automated testing with 70%+ coverage requirement"
- "Security vulnerability scanning on every commit"
- "SonarQube detects code smells and security hotspots"
- "Continuous deployment to Vercel"

### Conclusion (30 seconds)

**Say:** "This International Payment System demonstrates enterprise-grade security with bcrypt password hashing, JWT authentication, MFA, comprehensive input validation, protection against all major attacks, employee verification workflows, and a complete DevSecOps pipeline. Thank you for watching!"

**Show:** Final screen with:
- GitHub repository URL
- Key features list
- Team member names

## Post-Recording

### 1. Export Video
- File → Remux Recordings (if using mkv)
- Convert to MP4

### 2. Edit (Optional)
- Trim any mistakes
- Add title screen
- Add captions
- Keep under 5 minutes

### 3. Upload to YouTube
- Sign in to YouTube
- Click "Create" → "Upload video"
- Select your file
- Title: "International Payment System - Secure Payment Processing Demo"
- Description: Include GitHub link and feature list
- Visibility: **Unlisted** (as required)
- Copy the unlisted link

### 4. Update README
- Add YouTube link to README.md
- Test the link works

## Tips for Great Recording

✅ **Do:**
- Speak clearly and at a steady pace
- Rehearse the script 2-3 times
- Close unnecessary applications
- Use browser zoom (Ctrl/Cmd +) for better visibility
- Pause briefly between sections
- Highlight security features prominently

❌ **Don't:**
- Rush through demonstrations
- Leave personal information visible
- Show production credentials
- Forget to test audio before recording
- Include inappropriate content
- Exceed 5 minutes

## Troubleshooting

**OBS lagging during recording:**
- Lower resolution to 720p
- Reduce FPS to 24
- Close background applications
- Use window capture instead of display capture

**Audio not recording:**
- Check microphone permissions
- Select correct audio device in settings
- Adjust audio levels (aim for -12dB)

**Video too large:**
- Reduce bitrate to 2500 Kbps
- Use MP4 format
- Compress with Handbrake

**YouTube processing slowly:**
- Upload during off-peak hours
- Check internet connection
- Consider 720p instead of 1080p

---

## Example Timing Breakdown

\`\`\`
00:00-00:30  Introduction & Overview
00:30-02:00  Customer Registration + MFA Setup
02:00-03:00  Create International Payment
03:00-04:30  Employee Portal & Transaction Verification
04:30-05:00  Security Features & DevSecOps
05:00-05:30  Conclusion
\`\`\`

**Total: ~5 minutes 30 seconds** (aim for 4:30-5:00 actual recording)

---

Good luck with your recording! 🎬
