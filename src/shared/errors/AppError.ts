export class AppError extends Error {
  constructor(
    public code: string,
    public status: number = 400,
    public details?: any,
  ) {
    super(code)
    this.name = 'AppError'
  }
}
