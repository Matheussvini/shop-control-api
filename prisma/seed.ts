import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin_shopcontrol', 12);
  const email = 'matheussvini@outlook.com';
  await prisma.user.upsert({
    where: { email },
    update: {
      username: 'root',
      password: hashedPassword,
      type: 'admin',
    },
    create: {
      username: 'root',
      email,
      password: hashedPassword,
      type: 'admin', // Ajuste conforme necessário
    },
  });

  console.log('Seed data created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
