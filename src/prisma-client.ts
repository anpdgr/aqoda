const { PrismaClient } = require("@prisma/client");

function createPrismaClient(): object {
  return new PrismaClient();
}

module.exports = createPrismaClient;
