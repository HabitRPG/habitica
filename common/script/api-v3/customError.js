// Base class for custom application errors
// It extends Error and capture the stack trace
export default class CustomError extends Error {
  constructor () {
    super();
    Error.captureStackTrace(this, this.constructor);
  }
}
