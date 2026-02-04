/**
 * Generates a random short code for URL shortening.
 * Uses alphanumeric characters (a-z, A-Z, 0-9) for URL-safe codes.
 *
 * @param length - The length of the generated code (default: 6)
 * @returns A random alphanumeric string
 */
export function generateRandomShortCode(length: number = 6): string {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  // Use crypto.getRandomValues for better randomness when available
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += characters[array[i] % characters.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }

  return result;
}
