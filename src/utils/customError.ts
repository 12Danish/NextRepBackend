// utils/CustomError.ts
export class CustomError extends Error {
  statusCode: number;
  title: string;

  constructor(message: string, statusCode: number, title: string) {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
  }
}
