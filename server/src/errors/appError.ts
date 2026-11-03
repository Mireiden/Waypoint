export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
