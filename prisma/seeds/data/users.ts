import { PrismaClient } from '@prisma/client';
import { users } from '../mocks';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const seedUsers = async () => {
  console.log('👤 Sembrando usuarios...');

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  console.log('✅ Usuarios sembrados');
};

export default seedUsers;
