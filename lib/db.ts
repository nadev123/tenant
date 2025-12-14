import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    include: { settings: true },
  });
}

export async function getTenantByDomain(domain: string) {
  return prisma.tenant.findFirst({
    where: {
      OR: [
        { slug: domain },
        { customDomain: domain },
      ],
    },
    include: { settings: true },
  });
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
