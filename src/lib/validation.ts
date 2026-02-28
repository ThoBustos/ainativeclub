/**
 * Shared validation utilities.
 */

/**
 * Validates an email address using a simple regex.
 * For server-side validation, prefer Zod's email validator.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
