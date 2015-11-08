import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';

import errorHandler from '../../../../../website/src/middlewares/api-v3/errorHandler';

import { BadRequest } from '../../../../../website/src/libs/api-v3/errors';
import logger from '../../../../../website/src/libs/api-v3/logger';

describe('errorHandler', () => {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();

    sandbox.stub(logger, 'error');
  });

  it('sends internal server error if error is not a CustomError and is not identified', () => {
    let error = new Error();

    errorHandler(error, req, res, next);

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(500);
    expect(res.json).to.be.calledWith({
      error: 'InternalServerError',
      message: 'Internal server error.',
    });
  });

  it('identifies errors with statusCode property and format them correctly', () => {
    let error = new Error('Error message');
    error.statusCode = 400;

    errorHandler(error, req, res, next);

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(400);
    expect(res.json).to.be.calledWith({
      error: 'Error',
      message: 'Error message',
    });
  });

  it('doesn\'t leak info about 500 errors', () => {
    let error = new Error('Some secret error message');
    error.statusCode = 500;

    errorHandler(error, req, res, next);

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

    errorHandler(error, req, res, next);

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

    errorHandler(error, req, res, next);

    expect(logger.error).to.be.calledOnce;
    expect(logger.error).to.be.calledWith(error.stack, {
      originalUrl: req.originalUrl,
      headers: req.headers,
      body: req.body,
    });
  });

  it('does not send error if error is not defined', () => {
    errorHandler(null, req, res, next);

    expect(next).to.be.calledOnce;
    expect(res.status).to.not.be.called;
  });
});
