import pkg from "../generated/prisma/index.js";
import type { PrismaClient as PrismaClientType } from "../generated/prisma/index.js";
const { PrismaClient } = pkg;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

let prisma: PrismaClientType;

if (process.env.NODE_ENV === "production") {
  // In production, we create a new instance
  prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
} else {
  // In development, we use a global singleton to prevent exhausting connections
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
  prisma = global.prisma;
}

export default prisma;
