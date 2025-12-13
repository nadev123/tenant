# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  (User, Sign Up, Tenant Dashboard, Settings)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Reverse Proxy                              │
│  (Nginx - SSL/TLS, Rate Limiting, Compression)            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
  ┌─────▼──────┐        ┌────────▼──────┐
  │ Subdomain  │        │ Custom Domain │
  │ tenant.com │        │ custom.com    │
  └─────┬──────┘        └────────┬──────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────▼───────────┐
        │  Middleware (routing)  │
        │  Extract subdomain or  │
        │  match custom domain    │
        └────────────┬───────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Next.js Application                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Pages:                                               │  │
│  │ - Home / Landing (public)                           │  │
│  │ - Sign Up (public)                                  │  │
│  │ - Sign In (public)                                  │  │
│  │ - Dashboard (authenticated)                         │  │
│  │ - [slug]/dashboard (tenant-specific)               │  │
│  │ - Tenant Settings                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │ API Routes:                                         │  │
│  │ - /api/auth/signup (registration)                 │  │
│  │ - /api/auth/signin (login)                        │  │
│  │ - /api/auth/me (get user)                         │  │
│  │ - /api/auth/logout                                │  │
│  │ - /api/tenants/[slug] (get tenant)               │  │
│  │ - /api/tenants/[id] (update tenant)              │  │
│  │ - /api/tenants/current (get current tenant)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │ Middleware & Libraries:                             │  │
│  │ - Authentication (JWT + bcrypt)                    │  │
│  │ - Validation (email, password, slug, domain)      │  │
│  │ - Authorization (tenant access checks)             │  │
│  │ - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼───────────┐
        │  Prisma ORM            │
        │  (Type-safe queries)   │
        └────────────┬───────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              PostgreSQL Database                            │
│                                                              │
│  Tables:                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ users                                                │  │
│  │ ├── id (UUID)                                       │  │
│  │ ├── email (UNIQUE)                                 │  │
│  │ ├── password (hashed)                              │  │
│  │ ├── name                                           │  │
│  │ └── timestamps                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ tenants                                              │  │
│  │ ├── id (UUID)                                       │  │
│  │ ├── name                                           │  │
│  │ ├── slug (UNIQUE, subdomain)                      │  │
│  │ ├── customDomain (UNIQUE)                         │  │
│  │ ├── logo                                          │  │
│  │ ├── description                                    │  │
│  │ └── timestamps                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ pages                                                │  │
│  │ ├── id (UUID)                                       │  │
│  │ ├── title                                          │  │
│  │ ├── slug                                           │  │
│  │ ├── content                                        │  │
│  │ ├── published                                      │  │
│  │ ├── tenantId (FK → tenants)                       │  │
│  │ └── timestamps                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ settings                                             │  │
│  │ ├── id (UUID)                                       │  │
│  │ ├── tenantId (FK → tenants, UNIQUE)               │  │
│  │ ├── theme                                          │  │
│  │ ├── language                                       │  │
│  │ └── (extensible for more settings)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Relationships:                                             │
│  - User ←→ Tenant (many-to-many)                          │
│  - Tenant ← Page (one-to-many)                            │
│  - Tenant ← Settings (one-to-one)                         │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Sign Up Flow

```
User Input (Email, Password, Name, Tenant Name)
            │
            ▼
   Validation (Frontend)
            │
            ▼
   POST /api/auth/signup
            │
            ├─ Validate inputs (Backend)
            ├─ Check email uniqueness
            ├─ Check tenant slug uniqueness
            ├─ Hash password
            └─ Create user & tenant
            │
            ▼
   Create JWT Token
            │
            ▼
   Set HTTP-Only Cookie
            │
            ▼
   Redirect to Dashboard
            │
            ▼
   User Authenticated
```

### Tenant Access Flow (Subdomain)

```
Request: mycompany.localhost:3000/dashboard
            │
            ▼
   Nginx (reverse proxy)
            │
            ▼
   Middleware (middleware.ts)
            │
            ├─ Extract subdomain: "mycompany"
            └─ Rewrite to: /mycompany/dashboard
            │
            ▼
   Route: app/[slug]/dashboard/page.tsx
            │
            ├─ Fetch tenant by slug
            ├─ Fetch user data
            └─ Validate access
            │
            ▼
   API: GET /api/tenants/mycompany
            │
            ▼
   Query Database
            │
            ├─ SELECT * FROM tenants WHERE slug = 'mycompany'
            └─ SELECT * FROM settings WHERE tenantId = ?
            │
            ▼
   Return Tenant Data
            │
            ▼
   Render Dashboard Page
```

### Custom Domain Flow

```
Request: custom-domain.com
            │
            ▼
   Nginx (DNS points to server)
            │
            ▼
   Middleware (middleware.ts)
            │
            ├─ Check hostname against request
            ├─ Query: SELECT * FROM tenants WHERE customDomain = 'custom-domain.com'
            └─ Route to tenant dashboard
            │
            ▼
   Display Tenant Content
```

## Authentication Flow

```
┌─────────────────────────────────────────────────┐
│ Client Request                                  │
│ (with JWT in Cookie)                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Extract JWT Cookie  │
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Verify JWT Signature│
        │ (using JWT_SECRET)  │
        └─────────┬───────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
    Valid              Invalid
    (userId,          (401 Unauthorized)
     tenantId)        │
        │              ▼
        │         Redirect to /signin
        │
        ▼
    Check Token Expiry
        │
    ┌───┴────┐
    │        │
    ▼        ▼
 Valid    Expired
    │        │
    │        ▼
    │    Redirect to /signin
    │
    ▼
Attach User Context
    │
    ▼
Process Request
    │
    ▼
Return Response
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────┐
│ DNS                                             │
│ yourdomain.com → 192.168.1.1                   │
│ *.yourdomain.com → 192.168.1.1                 │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ Internet / Firewall                             │
│ (UFW: Allow 80, 443, 22)                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ Nginx (Reverse Proxy)                           │
│ - Port 80 (HTTP → HTTPS redirect)              │
│ - Port 443 (HTTPS with SSL/TLS)                │
│ - Rate limiting (api zone, auth zone)          │
│ - Gzip compression                             │
│ - Security headers                             │
│ - Static file caching                          │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼────────┐
│ App Instance 1 │  │ App Instance 2 │ (Load Balanced)
│ (PM2 process)  │  │ (PM2 process)  │
│ Port 3000      │  │ Port 3001      │
└───────┬────────┘  └──────┬────────┘
        │                  │
        └──────────┬───────┘
                   │
        ┌──────────▼──────────┐
        │   PostgreSQL        │
        │   (Primary)         │
        │                     │
        │  - Automated backup │
        │  - Replication ready│
        └─────────────────────┘
```

## State Management

```
Client State:
- Form data (localStorage for persistence)
- User profile (React state)
- Tenant list (React state)

Server State:
- User session (JWT token in cookie)
- User data (PostgreSQL)
- Tenant data (PostgreSQL)
- Settings (PostgreSQL)

Session Flow:
User Login
    │
    ▼
Generate JWT Token
    │
    ├─ Payload: {userId, tenantId}
    ├─ Secret: JWT_SECRET
    └─ Expiry: 30 days
    │
    ▼
Set HTTP-Only Cookie
    │
    ├─ Secure: true (production)
    ├─ SameSite: lax
    ├─ HttpOnly: true (no JS access)
    └─ Max-Age: 30 days
    │
    ▼
Cookie Sent with Each Request
    │
    ▼
JWT Verified on Server
    │
    ▼
Access Granted/Denied
```

## Multi-Tenancy Implementation

```
Data Isolation Strategy:
├─ Row-Level Security
│  └─ All queries filter by tenantId
│
├─ Foreign Keys
│  └─ Pages.tenantId → Tenants.id
│  └─ Settings.tenantId → Tenants.id
│
└─ Application Logic
   └─ Verify user has access to tenant
   └─ Validate tenantId in requests

Schema Design:
┌─────────────┐
│   users     │
│ (shared)    │
└────┬────────┘
     │
     │ many-to-many
     │
┌────▼────────┐        ┌──────────────┐
│   tenants   │◄──────┤   settings   │
│(isolated)   │        │ (1 per tenant)
└────┬────────┘        └──────────────┘
     │
     │ one-to-many
     │
┌────▼────────┐
│   pages     │
│ (isolated)  │
└─────────────┘
```

## Error Handling Flow

```
Request
    │
    ▼
Validation Error?
    ├─ Yes → 400 Bad Request
    └─ No ▼
        │
Authentication Error?
    ├─ Yes → 401 Unauthorized
    └─ No ▼
        │
Authorization Error?
    ├─ Yes → 403 Forbidden
    └─ No ▼
        │
Not Found?
    ├─ Yes → 404 Not Found
    └─ No ▼
        │
Server Error?
    ├─ Yes → 500 Internal Server Error
    └─ No ▼
        │
    Success → 200/201 OK
        │
        ▼
    Send Response
```

## Performance Considerations

```
Optimization Layers:

1. Client Side
   - Next.js static optimization
   - Code splitting
   - Image optimization
   - Lazy loading

2. Network
   - Nginx compression (gzip)
   - HTTPS/HTTP2
   - Caching headers
   - CDN ready

3. Database
   - Prisma query optimization
   - Database indexing
   - Connection pooling
   - Query monitoring

4. Application
   - JWT validation caching
   - Database query optimization
   - Rate limiting
   - Request/response compression
```

---

This architecture is:
✅ Scalable - Supports multiple app instances
✅ Secure - Multiple security layers
✅ Isolated - Complete data isolation per tenant
✅ Performant - Optimized at all layers
✅ Maintainable - Clean separation of concerns
✅ Deployable - Works on any server
