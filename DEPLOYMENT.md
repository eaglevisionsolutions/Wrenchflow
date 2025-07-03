# WrenchFlow Deployment Guide for cPanel

## Prerequisites

Before deploying to cPanel, ensure your hosting provider supports:
- Node.js applications (version 18+ recommended)
- PostgreSQL database
- SSL certificates for HTTPS (required for authentication)
- Custom domains or subdomains

## Pre-Deployment Steps

### 1. Environment Configuration

Create a `.env.production` file with the following variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secure-session-secret-here
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-repl-id
NODE_ENV=production
PORT=3000
```

### 2. Build the Application

Run these commands to prepare for deployment:
```bash
npm run build
npm run db:push
```

## cPanel Deployment Options

### Option 1: Node.js App (Recommended)
If your cPanel supports Node.js applications:

1. **Upload Files**: Upload all project files to your domain's folder
2. **Install Dependencies**: Use cPanel's Node.js interface to install packages
3. **Configure App**: Set startup file to `server/index.js`
4. **Environment Variables**: Add your production environment variables
5. **Database Setup**: Create PostgreSQL database and update DATABASE_URL

### Option 2: Subdomain Deployment
Deploy on a subdomain like `wrenchflow.yourdomain.com`:

1. Create subdomain in cPanel
2. Upload project files to subdomain folder
3. Configure DNS and SSL certificate
4. Follow Node.js app setup steps

### Option 3: VPS/Dedicated Server
For full control, consider upgrading to VPS hosting:

1. Install Node.js and PostgreSQL
2. Use PM2 for process management
3. Configure Nginx as reverse proxy
4. Set up SSL certificates

## Database Migration

1. **Export Schema**: Use Drizzle to generate SQL migration files
2. **Import to Production**: Run migrations on your production PostgreSQL database
3. **Verify Connection**: Test database connectivity with your production credentials

## Authentication Setup

1. **Register OAuth App**: Contact Replit support to register your production domain
2. **Update Callback URLs**: Ensure `https://yourdomain.com/api/callback` is registered
3. **SSL Certificate**: HTTPS is required for OAuth to work properly

## Common Issues & Solutions

### Issue: Node.js Not Supported
**Solution**: Upgrade hosting plan or switch to Node.js-compatible hosting

### Issue: Database Connection Errors
**Solution**: Verify DATABASE_URL format and firewall settings

### Issue: Authentication Fails
**Solution**: Ensure HTTPS is enabled and domain is registered with Replit

### Issue: File Upload Limits
**Solution**: Increase upload limits in cPanel or use Git deployment

## Alternative Deployment Platforms

If cPanel doesn't support Node.js well, consider:
- **Vercel**: Excellent for Node.js apps with PostgreSQL
- **Railway**: Simple deployment with database included
- **DigitalOcean App Platform**: Managed Node.js hosting
- **Heroku**: Traditional PaaS with PostgreSQL add-ons

## Post-Deployment Checklist

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Authentication flow works
- [ ] All pages load correctly
- [ ] SSL certificate active
- [ ] Environment variables configured
- [ ] Regular backups scheduled

## Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Database Backups**: Schedule automatic PostgreSQL backups
3. **Log Monitoring**: Monitor application logs for issues
4. **Performance**: Monitor response times and database queries

## Need Help?

If you encounter issues during deployment:
1. Check cPanel error logs
2. Verify Node.js version compatibility
3. Test database connection separately
4. Contact your hosting provider for Node.js support details