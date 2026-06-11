import { AppError } from "./appError.js";

export class ConflictError extends AppError {
  constructor(
    public message = "Conflict",
    public details?: string,
  ) {
    super(message, 403);
    this.details = details;
  }
}
