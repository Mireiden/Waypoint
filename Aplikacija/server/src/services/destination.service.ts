import { getDestinationById } from "../../generated/prisma/sql/getDestinationById.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { prisma } from "../lib/prisma.js";

export const findById = async (id: number) => {
  const [dest] = await prisma.$queryRawTyped(getDestinationById(id));
  if (!dest) throw new NotFoundError();
  return dest;
};
