import { AppError } from "./appError.js";

export class ValidationError extends AppError {
  constructor(public details?: object) {
    super("Validation failed", 400);
    this.details = details;
  }
}
