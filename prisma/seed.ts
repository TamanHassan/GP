import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create an employer user
  const employer = await prisma.user.create({
    data: {
      name: 'Chef',
      email: 'chef@test.com',
      password: '1234',
      role: 'EMPLOYER',
    },
  });

  // Create employee users
  const employees = [
    { name: 'Anna', email: 'anna@test.com', password: '1234' },
    { name: 'Bjorn', email: 'bjorn@test.com', password: '1234' },
    { name: 'Carla', email: 'carla@test.com', password: '1234' },
    { name: 'David', email: 'david@test.com', password: '1234' },
    { name: 'Emma', email: 'emma@test.com', password: '1234' },
  ];

  for (const emp of employees) {
    const user = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: emp.password,
        role: 'EMPLOYEE',
      },
    });

    await prisma.employee.create({
      data: {
        name: emp.name,
        userId: user.id,
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
