# MultiTenant Platform - Quick Start

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL (local or remote)

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and update DATABASE_URL
   ```

3. **Setup database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Configure local subdomains** (optional but recommended)
   
   **On Windows:**
   - Edit `C:\Windows\System32\drivers\etc\hosts`
   - Add:
     ```
     127.0.0.1 localhost
     127.0.0.1 app.localhost
     127.0.0.1 mycompany.localhost
     ```

   **On Mac/Linux:**
   - Edit `/etc/hosts`
   - Add:
     ```
     127.0.0.1 localhost
     127.0.0.1 app.localhost
     127.0.0.1 mycompany.localhost
     ```

6. **Visit the app**
   - Main: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Tenant: http://mycompany.localhost:3000

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation.

## 🐳 Docker Setup

```bash
# Start with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Access the app
# http://localhost:3000
```

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## ✨ Features

- ✅ Sign Up / Sign In
- ✅ Multi-Tenant Dashboard
- ✅ Subdomain Routing (tenant.yourdomain.com)
- ✅ Custom Domains Support
- ✅ Tenant Settings
- ✅ User Management
- ✅ No Vercel Required
- ✅ No Redis Required
- ✅ PostgreSQL Database
- ✅ Full TypeScript

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- JWT Authentication

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── [slug]/            # Tenant-specific pages
│   ├── tenant/            # Tenant management
│   ├── signup/            # Public signup page
│   ├── signin/            # Public signin page
│   └── dashboard/         # User dashboard
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── middleware.ts         # Subdomain routing
└── README.md            # Full documentation
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Input validation
- ✅ Rate limiting ready
- ⚠️ Enable HTTPS in production

## 🐛 Troubleshooting

**Subdomains not working?**
- Check your hosts file configuration
- Clear browser cache
- Restart dev server

**Database connection error?**
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database user has permissions

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💡 What's Next?

1. Build more features for your tenants
2. Add email notifications
3. Implement payment/billing
4. Add team invitations
5. Create tenant-specific content pages
6. Add file uploads
7. Build API for external integrations
8. Add analytics

## 📞 Support

For issues and questions, check the documentation or create an issue.

---

Happy building! 🚀
