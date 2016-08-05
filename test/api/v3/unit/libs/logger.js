import winston from 'winston';
import requireAgain from 'require-again';

/* eslint-disable global-require */
describe('logger', () => {
  let pathToLoggerLib = '../../../../../website/server/libs/logger';
  let infoSpy;
  let errorSpy;

  beforeEach(() => {
    infoSpy = sandbox.stub();
    errorSpy = sandbox.stub();
    sandbox.stub(winston, 'Logger').returns({
      info: infoSpy,
      error: errorSpy,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('info', () => {
    let attachLogger = requireAgain(pathToLoggerLib);
    attachLogger.info(1, 2, 3);
    expect(infoSpy).to.be.calledOnce;
    expect(infoSpy).to.be.calledWith(1, 2, 3);
  });

  describe('error', () => {
    it('with custom arguments', () => {
      let attachLogger = requireAgain(pathToLoggerLib);
      attachLogger.error(1, 2, 3, 4);
      expect(errorSpy).to.be.calledOnce;
      expect(errorSpy).to.be.calledWith(1, 2, 3, 4);
    });

    it('with error', () => {
      let attachLogger = requireAgain(pathToLoggerLib);
      let errInstance = new Error('An error.');
      attachLogger.error(errInstance, {
        data: 1,
      }, 2, 3);
      expect(errorSpy).to.be.calledOnce;
      // using calledWith doesn't work
      let lastCallArgs = errorSpy.lastCall.args;

      expect(lastCallArgs[3]).to.equal(3);
      expect(lastCallArgs[2]).to.equal(2);
      expect(lastCallArgs[1]).to.eql({
        data: 1,
        fullError: errInstance,
      });
      expect(lastCallArgs[0]).to.eql(errInstance.stack);
    });
  });
});
