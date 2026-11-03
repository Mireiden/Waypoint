import { AppError } from "./appError.js";

export class UnauthorizedError extends AppError {
  constructor(
    public message = "Unauthorized",
    public details?: string,
  ) {
    super(message, 401);
    this.details = details;
  }
}
