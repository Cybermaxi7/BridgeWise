// src/errors/validation.error.ts
import { BaseError } from "./base.error";

export class ValidationError extends BaseError {
  constructor(message = "Validation failed", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}