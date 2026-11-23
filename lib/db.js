import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientWasm } from '@prisma/client/wasm';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis;
const IS_CF = process.env.MAHAM_CF === '1';

function cfClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return new PrismaClientWasm({ adapter: new PrismaNeon(pool) });
}

let nodeClient;
export const db = IS_CF
  ? new Proxy({}, { get: (_, prop) => cfClient()[prop] })
  : (nodeClient = globalForPrisma.prisma || new PrismaClient());

if (!IS_CF && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = nodeClient;
