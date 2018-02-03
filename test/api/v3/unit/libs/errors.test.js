// TODO move to shared tests
import {
  CustomError,
  NotAuthorized,
  BadRequest,
  InternalServerError,
  NotFound,
} from '../../../../../website/server/libs/errors';

describe('Custom Errors', () => {
  describe('CustomError', () => {
    it('is an instance of Error', () => {
      let customError = new CustomError();

      expect(customError).to.be.an.instanceOf(Error);
    });
  });

  describe('NotAuthorized', () => {
    it('is an instance of CustomError', () => {
      let notAuthorizedError = new NotAuthorized();

      expect(notAuthorizedError).to.be.an.instanceOf(CustomError);
    });

    it('it returns an http code of 401', () => {
      let notAuthorizedError = new NotAuthorized();

      expect(notAuthorizedError.httpCode).to.eql(401);
    });

    it('returns a default message', () => {
      let notAuthorizedError = new NotAuthorized();

      expect(notAuthorizedError.message).to.eql('Not authorized.');
    });

    it('allows a custom message', () => {
      let notAuthorizedError = new NotAuthorized('Custom Error Message');

      expect(notAuthorizedError.message).to.eql('Custom Error Message');
    });
  });

  describe('NotFound', () => {
    it('is an instance of CustomError', () => {
      let notAuthorizedError = new NotFound();

      expect(notAuthorizedError).to.be.an.instanceOf(CustomError);
    });

    it('it returns an http code of 404', () => {
      let notAuthorizedError = new NotFound();

      expect(notAuthorizedError.httpCode).to.eql(404);
    });

    it('returns a default message', () => {
      let notAuthorizedError = new NotFound();

      expect(notAuthorizedError.message).to.eql('Not found.');
    });

    it('allows a custom message', () => {
      let notAuthorizedError = new NotFound('Custom Error Message');

      expect(notAuthorizedError.message).to.eql('Custom Error Message');
    });
  });

  describe('BadRequest', () => {
    it('is an instance of CustomError', () => {
      let badRequestError = new BadRequest();

      expect(badRequestError).to.be.an.instanceOf(CustomError);
    });

    it('it returns an http code of 401', () => {
      let badRequestError = new BadRequest();

      expect(badRequestError.httpCode).to.eql(400);
    });

    it('returns a default message', () => {
      let badRequestError = new BadRequest();

      expect(badRequestError.message).to.eql('Bad request.');
    });

    it('allows a custom message', () => {
      let badRequestError = new BadRequest('Custom Error Message');

      expect(badRequestError.message).to.eql('Custom Error Message');
    });
  });

  describe('InternalServerError', () => {
    it('is an instance of CustomError', () => {
      let internalServerError = new InternalServerError();

      expect(internalServerError).to.be.an.instanceOf(CustomError);
    });

    it('it returns an http code of 500', () => {
      let internalServerError = new InternalServerError();

      expect(internalServerError.httpCode).to.eql(500);
    });

    it('returns a default message', () => {
      let internalServerError = new InternalServerError();

      expect(internalServerError.message).to.eql('An unexpected error occurred.');
    });

    it('allows a custom message', () => {
      let internalServerError = new InternalServerError('Custom Error Message');

      expect(internalServerError.message).to.eql('Custom Error Message');
    });
  });
});
