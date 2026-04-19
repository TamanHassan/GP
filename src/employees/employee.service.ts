import { prisma } from "../prisma/client.js";

export const getAllEmployees = async () => {
  const users = await prisma.user.findMany({
    include: {
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return users.map(user => ({
    id: user.employee?.id || user.id,
    name: user.employee?.name || 'N/A',
    email: user.email,
    role: user.role,
    userId: user.id,
    hasEmployeeProfile: !!user.employee
  }));
};

export const createEmployee = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password,
        role: "EMPLOYEE" as any,
      },
    });

    const employee = await tx.employee.create({
      data: {
        name,
        userId: user.id,
      },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return {
      id: employee.id,
      name: employee.name,
      email: employee.user.email,
    };
  });
};

export const deleteEmployee = async (id: number) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      userId: true,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.employee.delete({ where: { id } });
    await tx.user.delete({ where: { id: employee.userId } });
  });
};

export const deleteUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction(async (tx) => {
    if (user.employee) {
      await tx.employee.delete({ where: { id: user.employee.id } });
    }
    await tx.user.delete({ where: { id: userId } });
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