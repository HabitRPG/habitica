import CustomError from './customError';

export class NotAuthorized extends CustomError {
  constructor (customMessage) {
    super();
    this.name = this.constructor.name;
    this.message = customMessage || 'Not authorized.';
  }
}
