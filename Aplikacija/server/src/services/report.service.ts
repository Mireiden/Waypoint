import type { CreateReportInput, ListReportsQuery, SetReportsStatusInput } from "../schemas/report.schema.js";

import { reportedTargets } from "../../generated/prisma/sql/reportedTargets.js";
import { BadRequestError } from "../errors/badRequestError.js";
import { prisma } from "../lib/prisma.js";
import { removeUndefined } from "../utils/removeUndefined.js";

interface ReportedTarget {
  count: number;
  id: number;
  latest: Date;
  type: TargetType;
}

type TargetType = "destination" | "review" | "user";

const targetColumn = (targetId: number, targetType: TargetType) =>
  targetType === "destination"
    ? { destinationId: targetId }
    : targetType === "review"
      ? { reviewId: targetId }
      : { reportedUserId: targetId };

export const findReportedTargets = async (query: ListReportsQuery): Promise<ReportedTarget[]> => {
  const rows = await prisma.$queryRawTyped(reportedTargets(query.status));

  //sql returns the fields as nullable, although they shouldn't be, so we filter the type
  let targets = rows.flatMap((r): ReportedTarget[] =>
    r.count == null || r.type === null || r.id === null || r.latest === null
      ? []
      : [{ count: r.count, id: r.id, latest: r.latest, type: r.type as TargetType }],
  );

  if (query.targetType) targets = targets.filter((t) => t.type === query.targetType);

  if (query.sort === "newest") {
    targets.sort((a, b) => b.latest.getTime() - a.latest.getTime());
  } else if (query.sort === "oldest") {
    targets.sort((a, b) => a.latest.getTime() - b.latest.getTime());
  } else {
    targets.sort((a, b) => b.count - a.count);
  }

  return targets;
};

export const findReportsForTarget = async (targetId: number, targetType: TargetType) => {
  return await prisma.report.findMany({
    where: targetColumn(targetId, targetType),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reason: true,
      note: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });
};

export const createReport = async (reporterId: number, data: CreateReportInput) => {
  const { note, reason, targetId, targetType } = data;
  if (targetType === "user" && targetId === reporterId)
    throw new BadRequestError("You can't report yourself");

  return await prisma.report.create({
    data: removeUndefined({
      note,
      reason,
      userId: reporterId,
      ...targetColumn(targetId, targetType),
    }),
    select: { id: true, reason: true, note: true, status: true, createdAt: true },
  });
};

export const setTargetReportsStatus = async (
  targetId: number,
  targetType: TargetType,
  status: SetReportsStatusInput["status"],
) => {
  return await prisma.report.updateManyAndReturn({
    where: targetColumn(targetId, targetType),
    data: { status },
  });
};
