/**
 * Server-side input validation utilities for Edge Functions
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL_REGEX.test(email);
}

export function isValidUUID(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateEmail(email: unknown, fieldName: string = 'email'): string {
  if (!email || typeof email !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }
  const trimmed = email.trim();
  if (!isValidEmail(trimmed)) {
    throw new ValidationError(`${fieldName} is not a valid email address`);
  }
  return trimmed;
}

export function validateUUID(id: unknown, fieldName: string = 'id'): string {
  if (!id || typeof id !== 'string') {
    throw new ValidationError(`${fieldName} is required`);
  }
  const trimmed = id.trim();
  if (!isValidUUID(trimmed)) {
    throw new ValidationError(`${fieldName} is not a valid UUID`);
  }
  return trimmed;
}
