// utils/CustomError.ts
export class CustomError extends Error {
  statusCode: number;
  errors?: any; // Can be string[] or an array of ValidationError

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
