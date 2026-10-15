class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);              // sets this.message
    this.statusCode = statusCode; // e.g. 404
    this.errors = errors;         // optional details, e.g. validation problems
  }
}
module.exports = AppError;