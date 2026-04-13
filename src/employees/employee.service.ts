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

