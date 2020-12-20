/**
 * Helper methods.
 */

import crypto from 'crypto';

/**
 * Create a random string.
 * @param  length the string length.
 * @returns the random string.
 */
export function randomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % chars.length];
  }
  return result.join('');
}

/**
 * Wrap fn and return result for API Gateway.
 * @param fn the function to wrap
 */
export async function processAPILambda(fn: () => Promise<any>) {
  try {
    const result = await fn();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
    return {
      statusCode: e.statusCode || 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
}
