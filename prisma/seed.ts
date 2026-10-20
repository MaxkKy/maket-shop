import { prisma } from "../lib/prisma";
import "dotenv/config";
import argon2 from "argon2";
async function main() {
  const hashPassword = await argon2.hash(
    process.env.ADMIN_PASSWORD || "123456789",
  );
  await prisma.admin.upsert({
    where: { gmail: "admin@gmail.com" },
    update: {},
    create: {
      gmail: "admin@gmail.com",
      username: "admin",
      password: hashPassword,
      role: "ADMIN",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
