import { AppError } from "./appError.js";

export class ValidationError extends AppError {
  constructor(public details?: object) {
    super("Validation failed", 422);
    this.details = details;
  }
}
