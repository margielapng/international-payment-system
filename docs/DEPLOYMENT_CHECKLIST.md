# Deployment Checklist

Complete checklist for deploying the International Payment System to production.

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code coverage > 80%
- [ ] SonarQube scan passed (no critical issues)
- [ ] Security audit passed (`npm audit`)
- [ ] Dependencies updated to latest stable versions
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API routes
- [ ] Loading states implemented for all async operations

### Security
- [ ] All environment variables configured
- [ ] Secrets stored securely (not in code)
- [ ] SSL/TLS certificates obtained
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Authentication working correctly
- [ ] Authorization rules tested
- [ ] Session management secure
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] JWT tokens using strong secrets
- [ ] MFA tested and working
- [ ] Audit logging enabled

### Database
- [ ] Database schema created
- [ ] RLS policies enabled
- [ ] Triggers created
- [ ] Indexes added for performance
- [ ] Employee accounts seeded
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Database credentials secured

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] API response times < 200ms
- [ ] Database queries optimized
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets

## Deployment Steps

### 1. Environment Setup

#### Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
\`\`\`

#### Environment Variables
Set in Vercel dashboard or using CLI:
\`\`\`bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add ENCRYPTION_KEY
vercel env add NEXT_PUBLIC_APP_URL
\`\`\`

### 2. Database Setup

#### Run SQL Scripts
\`\`\`bash
# Connect to Supabase
psql $DATABASE_URL

# Run scripts in order
\i scripts/001_create_tables.sql
\i scripts/002_create_rls_policies.sql
\i scripts/003_create_triggers.sql
\i scripts/004_seed_employees.sql
\`\`\`

#### Verify Database
\`\`\`sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check employee accounts
SELECT email, role FROM employees;
\`\`\`

### 3. SSL/TLS Configuration

#### Vercel (Automatic)
- SSL automatically provisioned
- HTTPS enforced by default
- Custom domain SSL supported

#### Custom Server (Nginx)
\`\`\`bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
\`\`\`

### 4. DNS Configuration

#### Add DNS Records
\`\`\`
Type: A
Name: @
Value: [Your server IP]
TTL: 3600

Type: A
Name: www
Value: [Your server IP]
TTL: 3600

Type: CNAME
Name: api
Value: yourdomain.com
TTL: 3600
\`\`\`

### 5. Monitoring Setup

#### Vercel Analytics
- Enable in Vercel dashboard
- Configure alerts for errors
- Set up performance monitoring

#### Sentry (Error Tracking)
\`\`\`bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
\`\`\`

#### Uptime Monitoring
- Configure UptimeRobot or similar
- Monitor endpoints:
  - `/api/health`
  - `/`
  - `/customer/dashboard`
  - `/employee/dashboard`

### 6. Backup Configuration

#### Database Backups
\`\`\`bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
\`\`\`

#### Automated Backups
- Configure Supabase automatic backups
- Set retention period (30 days minimum)
- Test restore procedure

## Post-Deployment

### Verification

#### Functional Testing
- [ ] Landing page loads correctly
- [ ] Customer registration works
- [ ] Email verification works
- [ ] Customer login works
- [ ] Customer dashboard loads
- [ ] Transaction creation works
- [ ] Transaction history displays
- [ ] Employee login works
- [ ] Employee dashboard loads
- [ ] Transaction verification works
- [ ] Audit logs display

#### Security Testing
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present (check with securityheaders.com)
- [ ] SSL certificate valid (check with ssllabs.com)
- [ ] Rate limiting working
- [ ] Authentication required for protected routes
- [ ] Authorization rules enforced
- [ ] XSS protection working
- [ ] SQL injection protection working
- [ ] CSRF protection working

#### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 200ms
- [ ] Time to First Byte (TTFB) < 600ms
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

### Monitoring

#### Set Up Alerts
- [ ] Error rate > 1%
- [ ] Response time > 500ms
- [ ] Uptime < 99.9%
- [ ] Database connection errors
- [ ] Failed login attempts > 10/minute
- [ ] Disk space < 20%
- [ ] Memory usage > 80%
- [ ] CPU usage > 80%

#### Log Monitoring
- [ ] Application logs configured
- [ ] Error logs monitored
- [ ] Audit logs reviewed daily
- [ ] Security events alerted

### Documentation

- [ ] README updated with production URL
- [ ] API documentation published
- [ ] Deployment guide updated
- [ ] Runbook created for common issues
- [ ] Contact information for support
- [ ] Incident response plan documented

## Rollback Plan

### If Deployment Fails

#### Vercel
\`\`\`bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
\`\`\`

#### Database
\`\`\`bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
\`\`\`

#### DNS
- Revert DNS changes to previous values
- Wait for TTL to expire (usually 1 hour)

## Maintenance

### Regular Tasks

#### Daily
- [ ] Check error logs
- [ ] Review audit logs
- [ ] Monitor performance metrics
- [ ] Check backup completion

#### Weekly
- [ ] Review security alerts
- [ ] Check dependency updates
- [ ] Review user feedback
- [ ] Analyze usage patterns

#### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Test backup restoration
- [ ] Review access logs

#### Quarterly
- [ ] Penetration testing
- [ ] Compliance audit
- [ ] Disaster recovery drill
- [ ] Update documentation
- [ ] Review and update security policies

## Emergency Contacts

\`\`\`
Production Issues: production@payment-system.com
Security Issues: security@payment-system.com
Database Issues: dba@payment-system.com
On-Call Engineer: +1-XXX-XXX-XXXX
\`\`\`

## Compliance

### PCI DSS
- [ ] Cardholder data encrypted
- [ ] Access controls implemented
- [ ] Network security configured
- [ ] Vulnerability management program
- [ ] Regular security testing
- [ ] Security policy maintained

### GDPR
- [ ] Privacy policy published
- [ ] Data processing agreement signed
- [ ] User consent obtained
- [ ] Data retention policy implemented
- [ ] Right to erasure implemented
- [ ] Data breach notification procedure

### SOC 2
- [ ] Security controls documented
- [ ] Access controls implemented
- [ ] Change management process
- [ ] Incident response plan
- [ ] Business continuity plan
- [ ] Vendor management

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  
**Sign-off**: _______________

---

✅ **Ready for Production!**
