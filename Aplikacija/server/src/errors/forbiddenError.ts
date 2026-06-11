import { AppError } from "./appError.js";

export class ForbiddenError extends AppError {
  constructor(
    public message = "Forbidden.",
    public details?: string,
  ) {
    super(message, 403);
    this.details = details;
  }
}
