import errorHandler from '../../../../../website/src/middlewares/api-v3/errorHandler';

import { BadRequest } from '../../../../../website/src/libs/api-v3/errors';
import logger from '../../../../../website/src/libs/api-v3/logger';

describe('errorHandler', () => {
  let res, req;

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    req = {
      originalUrl: 'foo',
      headers: {},
      body: {},
    };

    sinon.stub(logger, 'error');
  });

  afterEach(() => {
    logger.error.restore();
  });

  it('sends internal server error if error is not a CustomError', () => {
    let error = new Error();

    errorHandler(error, req, res);

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(500);
    expect(res.json).to.be.calledWith({
      error: 'InternalServerError',
      message: 'Internal server error.',
    });
  });

  it('sends CustomError', () => {
    let error = new BadRequest();

    errorHandler(error, req, res);

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(400);
    expect(res.json).to.be.calledWith({
      error: 'BadRequest',
      message: 'Bad request.',
    });
  });

  it('logs error', () => {
    let error = new BadRequest();

    errorHandler(error, req, res);

    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith(error.stack, {
      originalUrl: req.originalUrl,
      headers: req.headers,
      body: req.body,
    });
  });

  it('does not send error if error is not defined', () => {
    let next = sinon.stub();
    errorHandler(null, req, res, next);

    expect(next).to.be.calledOnce;
    expect(res.status).to.not.be.called;
  });
});
