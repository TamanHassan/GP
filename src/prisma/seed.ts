import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: '1234',
      name: 'Anna',
      role: 'EMPLOYEE',
    },
  })

  console.log('Skapade användare:', user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
