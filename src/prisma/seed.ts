import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = [
    { email: 'anna@test.com',    password: '1234', name: 'Anna Svensson',   role: 'EMPLOYEE' as const },
    { email: 'bjorn@test.com',   password: '1234', name: 'Björn Lindqvist', role: 'EMPLOYEE' as const },
    { email: 'carla@test.com',   password: '1234', name: 'Carla Mäkinen',   role: 'EMPLOYEE' as const },
    { email: 'david@test.com',   password: '1234', name: 'David Holm',      role: 'EMPLOYEE' as const },
    { email: 'emma@test.com',    password: '1234', name: 'Emma Bergström',  role: 'EMPLOYEE' as const },
    { email: 'chef@test.com',    password: '1234', name: 'Chef Karlsson',   role: 'EMPLOYER' as const },
  ]

  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
    console.log(`Skapade: ${created.name} (${created.role})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
