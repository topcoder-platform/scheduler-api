/**
 * Contains custom errors.
 */

/**
 * Generic HTTP Error.
 */
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
/**
 * Bad Request HTTP 400 Error.
 */
export class BadRequestError extends HttpError {
  constructor(message: string, public params?: any) {
    super(400, message);
  }
}
