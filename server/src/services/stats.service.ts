import { prisma } from "../lib/prisma.js";

export const getStats = async () => {
  const [users, destinations, reviews, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.destination.count(),
    prisma.review.count(),
    prisma.report.count({ where: { status: "pending" } }),
  ]);

  return { users, destinations, reviews, pendingReports };
};
