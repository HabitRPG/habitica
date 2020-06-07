import logger, { _loggerConfig } from '../../../../website/server/libs/logger';
import {
  NotFound,
} from '../../../../website/server/libs/errors';

describe('logger', () => {
  let infoSpy;
  let warnSpy;
  let errorSpy;

  const originalLoggingEnabled = _loggerConfig.loggingEnabled;

  before(() => { // enable logging in tests
    _loggerConfig.loggingEnabled = true;
  });

  after(() => { // reset value of _loggerConfig.loggingEnabled
    _loggerConfig.loggingEnabled = originalLoggingEnabled;
  });

  beforeEach(() => {
    infoSpy = sandbox.stub(_loggerConfig.logger, 'info');
    warnSpy = sandbox.stub(_loggerConfig.logger, 'warn');
    errorSpy = sandbox.stub(_loggerConfig.logger, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('info', () => {
    it('calls winston\'s info log', () => {
      logger.info('1', 2);
      expect(infoSpy).to.be.calledOnce;
      expect(infoSpy).to.be.calledWith('1', { extraData: 2 });
    });

    it('allows up to two arguments', () => {
      expect(() => logger.info('1', 2, 3)).to.throw;
      expect(infoSpy).to.not.be.called;
    });

    it('has default message', () => {
      logger.info(1);
      expect(infoSpy).to.be.calledOnce;
      expect(infoSpy).to.be.calledWith('No message provided for log.', { extraData: 1 });
    });

    it('wraps non objects', () => {
      logger.info('message', [1, 2]);
      expect(infoSpy).to.be.calledOnce;
      expect(infoSpy).to.be.calledWithMatch('message', { extraData: [1, 2] });
    });

    it('does not wrap objects', () => {
      logger.info('message', { a: 1, b: 2 });
      expect(infoSpy).to.be.calledOnce;
      expect(infoSpy).to.be.calledWithMatch('message', { a: 1, b: 2 });
    });

    it('throws if two arguments and no message', () => {
      expect(() => logger.info({ a: 1 }, { b: 2 })).to.throw;
      expect(infoSpy).to.not.be.called;
    });
  });

  describe('error', () => {
    it('allows up to two arguments', () => {
      expect(() => logger.error('1', 2, 3)).to.throw;
      expect(errorSpy).to.not.be.called;
    });

    it('handled non-error object', () => {
      logger.error(1, 2);
      expect(errorSpy).to.be.calledOnce;
      expect(errorSpy).to.be.calledWithMatch('logger.error expects an Error instance', {
        invalidErr: 1,
        extraData: 2,
      });
    });

    context('error object', () => {
      it('logs the stack and the err data', () => {
        const errInstance = new Error('An error.');
        logger.error(errInstance, {
          data: 1,
        });

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWith(
          errInstance.stack,
          { data: 1, fullError: errInstance },
        );
      });

      it('logs the stack and the err data with it\'s own fullError property', () => {
        const errInstance = new Error('An error.');
        const anotherError = new Error('another error');

        logger.error(errInstance, {
          data: 1,
          fullError: anotherError,
        });

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWith(
          errInstance.stack,
          { data: 1, fullError: anotherError },
        );
      });

      it('logs the error when errorData is null', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, null);

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWithMatch(
          errInstance.stack,
          { },
        );
      });

      it('logs the error when errorData is not an object', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, true);

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWithMatch(
          errInstance.stack,
          { extraData: true },
        );
      });

      it('logs the error when errorData is a string', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, 'a string');

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWithMatch(
          errInstance.stack,
          { extraMessage: 'a string' },
        );
      });

      it('logs the error when errorData does not include isHandledError property', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, { httpCode: 400 });

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWith(
          errInstance.stack,
          { httpCode: 400, fullError: errInstance },
        );
      });

      it('logs the error when errorData includes isHandledError property but is a 500 error', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, {
          isHandledError: true,
          httpCode: 502,
        });

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWith(
          errInstance.stack,
          { httpCode: 502, isHandledError: true, fullError: errInstance },
        );
      });

      it('logs a warning when errorData includes isHandledError property and is not a 500 error', () => {
        const errInstance = new Error('An error.');

        logger.error(errInstance, {
          isHandledError: true,
          httpCode: 403,
        });

        expect(warnSpy).to.be.calledOnce;
        expect(warnSpy).to.be.calledWith(
          errInstance.stack,
          { httpCode: 403, isHandledError: true, fullError: errInstance },
        );
      });

      it('logs additional data from a CustomError', () => {
        const errInstance = new NotFound('An error.');

        errInstance.customField = 'Some interesting data';

        logger.error(errInstance, {});

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy).to.be.calledWith(
          errInstance.stack,
          {
            fullError: {
              customField: 'Some interesting data',
            },
          },
        );
      });
    });
  });
});
