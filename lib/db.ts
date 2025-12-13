import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: { settings: true },
  });
}

export async function getTenantByDomain(domain: string) {
  // Check if it's a custom domain or subdomain
  const parts = domain.split(".");
  
  // Check custom domain first
  const customDomain = await prisma.tenant.findUnique({
    where: { customDomain: domain },
    include: { settings: true },
  });
  
  if (customDomain) return customDomain;
  
  // Check subdomain
  if (parts.length > 2) {
    const subdomain = parts[0];
    return prisma.tenant.findUnique({
      where: { slug: subdomain },
      include: { settings: true },
    });
  }
  
  return null;
}

export async function getUserWithTenants(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { tenants: true },
  });
}

export async function createUser(email: string, password: string, name: string) {
  return prisma.user.create({
    data: { email, password, name },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createTenant(name: string, slug: string, userId: string) {
  return prisma.tenant.create({
    data: {
      name,
      slug,
      users: {
        connect: [{ id: userId }],
      },
      settings: {
        create: {},
      },
    },
  });
}
