import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ideathon.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ideathon.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const judgePassword = await bcrypt.hash('judge123', 10);
  await prisma.user.upsert({
    where: { email: 'judge1@ideathon.com' },
    update: {},
    create: {
      username: 'judge1',
      email: 'judge1@ideathon.com',
      password: judgePassword,
      role: 'JUDGE',
    },
  });

  const mentorPassword = await bcrypt.hash('mentor123', 10);
  await prisma.user.upsert({
    where: { email: 'mentor1@ideathon.com' },
    update: {},
    create: {
      username: 'mentor1',
      email: 'mentor1@ideathon.com',
      password: mentorPassword,
      role: 'MENTOR',
    },
  });

  console.log('Seed complete.');
  console.log('Admin:  admin@ideathon.com / admin123');
  console.log('Judge:  judge1@ideathon.com / judge123');
  console.log('Mentor: mentor1@ideathon.com / mentor123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
