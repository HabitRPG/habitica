import winston from 'winston';
import logger from '../../../../../website/server/libs/logger';

describe('logger', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = sandbox.stub(winston.Logger.prototype, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('info', () => {
    it('calls winston\'s info log', () => {
      logger.info(1, 2, 3);
      expect(logSpy).to.be.calledOnce;
      expect(logSpy).to.be.calledWith('info', 1, 2, 3);
    });
  });

  describe('error', () => {
    it('passes through arguments if the first arg is not an error object', () => {
      logger.error(1, 2, 3, 4);
      expect(logSpy).to.be.calledOnce;
      expect(logSpy).to.be.calledWith('error', 1, 2, 3, 4);
    });

    it('parses the error and passes it to the logger when the first arg is an error object', () => {
      let errInstance = new Error('An error.');
      logger.error(errInstance, {
        data: 1,
      }, 2, 3);

      expect(logSpy).to.be.calledOnce;
      expect(logSpy).to.be.calledWith(
        'error',
        errInstance.stack,
        { data: 1, fullError: errInstance },
        2,
        3
      );
    });
  });
});
