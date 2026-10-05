const { PrismaClient } = require("@prisma/client");

// Reuse single PrismaClient instance across the app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

module.exports = prisma;
