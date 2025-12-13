## Deployment Guide for MultiTenant Platform

This guide covers deploying the MultiTenant Platform on your own server without using Vercel.

### Prerequisites

- Ubuntu/Debian server or VPS
- Node.js 18+ installed
- PostgreSQL database
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE multitenant;
CREATE USER mtuser WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE multitenant TO mtuser;
\q
```

### Step 3: Application Setup

```bash
# Clone repository (or upload your code)
cd /var/www
git clone <your-repo-url> multitenant-app
cd multitenant-app

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
DATABASE_URL="postgresql://mtuser:strong_password@localhost:5432/multitenant"
JWT_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
NEXTAUTH_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
EOF

# Setup database
npx prisma migrate deploy

# Build application
npm run build
```

### Step 4: Configure PM2

```bash
# Start with PM2
pm2 start npm --name "multitenant" -- start

# Make it restart on reboot
pm2 startup
pm2 save
```

### Step 5: Configure Nginx

```bash
sudo cat > /etc/nginx/sites-available/multitenant << 'EOF'
upstream multitenant {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com *.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com *.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy settings
    location / {
        proxy_pass http://multitenant;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/multitenant /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d *.yourdomain.com

# Auto-renewal (automatic with nginx plugin)
sudo systemctl enable certbot.timer
```

### Step 7: DNS Configuration

#### For main domain:
```
Type: A
Name: yourdomain.com
Value: YOUR_SERVER_IP
```

#### For wildcard subdomains:
```
Type: A
Name: *.yourdomain.com
Value: YOUR_SERVER_IP
```

This allows tenants to use both:
- `tenant.yourdomain.com` (subdomain)
- Custom domains pointed to the same server

### Step 8: Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Monitoring and Maintenance

```bash
# View PM2 logs
pm2 logs multitenant

# Monitor app
pm2 monit

# Database backups
sudo -u postgres pg_dump multitenant > backup.sql

# Application updates
cd /var/www/multitenant-app
git pull origin main
npm install
npm run build
pm2 restart multitenant
npx prisma migrate deploy
```

### Troubleshooting

**App not starting:**
```bash
pm2 logs multitenant
```

**Database connection error:**
```bash
sudo -u postgres psql -c "SELECT 1"
```

**Nginx not working:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**SSL certificate issues:**
```bash
sudo certbot renew --dry-run
```

### Performance Optimization

1. **Enable caching headers** - Add to Nginx config
2. **Database indexing** - Check Prisma migrations
3. **CDN for static assets** - Consider Cloudflare
4. **Database replication** - For high availability
5. **Load balancing** - Multiple app instances

### Backup Strategy

```bash
# Daily database backup
0 2 * * * sudo -u postgres pg_dump multitenant | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### Security Checklist

- [ ] Change PostgreSQL default password
- [ ] Configure firewall properly
- [ ] Enable SSL/TLS
- [ ] Set strong JWT_SECRET
- [ ] Regular backups
- [ ] Monitor logs for issues
- [ ] Keep system updated
- [ ] Disable SSH password auth
- [ ] Use SSH keys only
- [ ] Configure fail2ban for brute force

### Cost Estimation

- **VPS (1GB RAM, 1 CPU)**: $3-5/month
- **Database storage**: Included
- **SSL certificate**: Free (Let's Encrypt)
- **Domain**: $10-15/year
- **Backups**: Free with cron jobs

### Support

For issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx error log: `/var/log/nginx/error.log`
3. Check app logs in Console
4. Review database connection

Happy deploying! 🚀
