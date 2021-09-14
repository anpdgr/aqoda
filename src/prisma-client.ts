import { PrismaClient } from "@prisma/client";

export default function createPrismaClient(): PrismaClient  {
  return new PrismaClient();
}
