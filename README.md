# MultiTenant Platform

A complete multi-tenant SaaS application built with Next.js 15, TypeScript, and PostgreSQL. Deploy on your own server with support for custom domains and subdomains.

## Features

✅ **Multi-Tenant Architecture** - Complete tenant isolation with separate data
✅ **Authentication** - Secure signup/signin with JWT and bcrypt
✅ **Subdomain Routing** - Auto-route `tenant.yourdomain.com` to tenant apps
✅ **Custom Domains** - Map custom domains directly to tenants
✅ **Dashboard** - User dashboard for managing multiple tenants
✅ **Tenant Settings** - Configure tenant name, description, and custom domain
✅ **No Vercel Required** - Deploy anywhere (your server, VPS, Docker, etc.)
✅ **No Redis** - Uses PostgreSQL for all data storage
✅ **Type-Safe** - Full TypeScript support

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   ├── signin/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── logout/route.ts
│   │   └── tenants/
│   │       ├── [slug]/route.ts
│   │       └── [id]/route.ts
│   ├── [slug]/                 # Tenant-specific pages
│   │   └── dashboard/page.tsx
│   ├── tenant/                 # Tenant management
│   │   └── [id]/settings/page.tsx
│   ├── signup/page.tsx         # Public signup
│   ├── signin/page.tsx         # Public signin
│   ├── dashboard/page.tsx      # User dashboard
│   ├── page.tsx                # Landing page
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts                 # Auth utilities
│   ├── db.ts                   # Database queries
│   ├── prisma.ts               # Prisma client
│   ├── validation.ts           # Input validation
│   └── middleware-helpers.ts   # Middleware utilities
├── prisma/
│   └── schema.prisma           # Database schema
├── middleware.ts               # Subdomain routing
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Quick Start

### 1. Prerequisites

- Node.js 18.17.0 or later
- PostgreSQL database
- npm or pnpm

### 2. Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

### 3. Configure Environment Variables

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/multitenant"

# Auth
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Create migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Configure Subdomains Locally

Add to your `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 localhost
127.0.0.1 app.localhost
127.0.0.1 mycompany.localhost
```

### 6. Run Development Server

```bash
npm run dev
```

Visit:
- Main site: `http://localhost:3000`
- Admin: `http://localhost:3000/dashboard`
- Tenant: `http://mycompany.localhost:3000`

## Database Schema

### Users
- `id` - Unique identifier
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's name
- `createdAt`, `updatedAt` - Timestamps

### Tenants
- `id` - Unique identifier
- `name` - Tenant name
- `slug` - URL-safe subdomain (unique)
- `customDomain` - Optional custom domain (unique)
- `logo` - Optional logo URL
- `description` - Tenant description
- `createdAt`, `updatedAt` - Timestamps

### Pages
- `id` - Unique identifier
- `title` - Page title
- `slug` - URL-safe slug
- `content` - Page content
- `published` - Publication status
- `tenantId` - Associated tenant
- `createdAt`, `updatedAt` - Timestamps

### Settings
- `id` - Unique identifier
- `tenantId` - Associated tenant
- `theme` - Theme preference
- `language` - Language preference

## Authentication Flow

1. **Sign Up**
   - User creates account with email/password
   - Creates initial tenant with slug
   - Returns JWT token in secure cookie

2. **Sign In**
   - User authenticates with email/password
   - Returns JWT token for first tenant
   - Can switch between tenants

3. **Protected Routes**
   - All authenticated routes check JWT token
   - Token contains userId and tenantId
   - Automatic 401 redirect if unauthorized

## API Routes

### Authentication

- `POST /api/auth/signup` - Create account and tenant
- `POST /api/auth/signin` - Login with email/password
- `GET /api/auth/me` - Get current user and tenants
- `POST /api/auth/logout` - Logout (clear cookie)

### Tenants

- `GET /api/tenants/[slug]` - Get tenant by slug
- `GET /api/tenants/[id]` - Get tenant by ID
- `PUT /api/tenants/[id]` - Update tenant settings

## Deploying to Your Server

### Option 1: Direct Server Deployment

```bash
# 1. Build the app
npm run build

# 2. Start production server
npm start

# 3. Configure reverse proxy (nginx example)
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t multitenant-app .
docker run -p 3000:3000 --env-file .env.local multitenant-app
```

## Custom Domain Configuration

### For Production

1. **Point domain to server**
   - Update DNS A record to your server IP
   - Example: `example.com` → `192.168.1.1`

2. **Configure SSL (Let's Encrypt)**
   - Use certbot to generate certificates
   - Update reverse proxy config

3. **Add in tenant settings**
   - User enters custom domain in `/tenant/[id]/settings`
   - Domain is validated and stored
   - Middleware automatically routes requests

### Subdomain Routing

The middleware in `middleware.ts` handles:
- Extracting subdomain from request hostname
- Routing to tenant dashboard at `[slug]/dashboard`
- Works with both localhost and production domains

## Development

### Run Tests

```bash
npm test
```

### Database Commands

```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev

# Reset database
npx prisma migrate reset
```

### Type Checking

```bash
# Check types
npm run type-check
```

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

## Tenant Slug Rules

- 3-50 characters
- Lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Must be unique across all tenants

## Customization

### Add Pages to Tenant

1. Create page in `app/[slug]/[page]/page.tsx`
2. Use tenant ID from URL slug
3. Fetch tenant data from `/api/tenants/[slug]`

### Extend Tenant Model

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update API routes as needed

### Customize Styling

Edit `tailwind.config.ts` to add custom colors, fonts, etc.

## Security Considerations

- ✅ Passwords hashed with bcryptjs
- ✅ JWTs signed with secret key
- ✅ Secure HTTP-only cookies
- ✅ CSRF protection via same-site cookies
- ⚠️ Add rate limiting in production
- ⚠️ Use HTTPS in production
- ⚠️ Validate all user inputs
- ⚠️ Set secure database credentials

## Environment Variables

See `.env.example` for all available options.

## Troubleshooting

### Subdomains not working locally

- Check `/etc/hosts` entries
- Restart development server
- Clear browser cookies
- Try incognito mode

### Database connection error

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Ensure database user has permissions

### Custom domain not accessible

- Check DNS A record points to server
- Verify reverse proxy configuration
- Check firewall rules
- Ensure domain is added in tenant settings

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

## Next Steps

1. ✅ Clone/download the repository
2. ✅ Install dependencies: `npm install`
3. ✅ Set up PostgreSQL database
4. ✅ Configure `.env.local`
5. ✅ Run migrations: `npx prisma migrate dev`
6. ✅ Start dev server: `npm run dev`
7. ✅ Visit `http://localhost:3000`

Happy building! 🚀
