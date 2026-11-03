import { AppError } from "./appError.js";

export class NotFoundError extends AppError {
  constructor(
    public message = "Not found",
    public details?: string,
  ) {
    super(message, 404);
    this.details = details;
  }
}
