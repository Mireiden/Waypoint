import { AppError } from "./appError.js";

export class ConflictError extends AppError {
  constructor(
    public message = "Conflict",
    public details?: string,
  ) {
    super(message, 409);
    this.details = details;
  }
}
