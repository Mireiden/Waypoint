import { AppError } from "./appError.js";

export class ValidationError extends AppError {
  constructor(
    public message = "Bad request",
    public details?: string,
  ) {
    super(message, 400);
    this.details = details;
  }
}
