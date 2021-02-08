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
/**
 * Unauthorized Request HTTP 400 Error.
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string, public params?: any) {
    super(403, message);
  }
}
/**
 * Not Found HTTP 404 Error.
 */
export class NotFoundError extends HttpError {
  constructor(message: string, public params?: any) {
    super(404, message);
  }
}
