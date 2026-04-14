import { prisma } from "../prisma/client.js";

export const getAllEmployees = async () => {
  return prisma.employee.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
};

export const verifyCredentials = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
    },
  });

  if (!user || user.password !== password) {
    return null;
  }

  return user;
};

