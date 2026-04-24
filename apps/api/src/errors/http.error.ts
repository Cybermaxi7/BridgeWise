// src/errors/http.error.ts
import { BaseError } from "./base.error";

export class HttpError extends BaseError {
  constructor(message: string, statusCode: number, code?: string) {
    super(message, statusCode, code || "HTTP_ERROR");
  }
}