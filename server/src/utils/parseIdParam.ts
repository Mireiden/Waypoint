import { BadRequestError } from "../errors/badRequestError.js";

export const parseIdParam = (value: unknown, label = "ID"): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return id;
};
