/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import cors from '../../../../../website/server/middlewares/cors';

describe('cors middleware', () => {
  let res, req, next;

  beforeEach(() => {
    req = generateReq();
    res = generateRes();
    next = generateNext();
  });

  it('sets the correct headers', () => {
    cors(req, res, next);
    expect(res.set).to.have.been.calledWith({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,HEAD,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key',
    });
    expect(res.sendStatus).to.not.have.been.called;
    expect(next).to.have.been.called.once;
  });

  it('responds immediately if method is OPTIONS', () => {
    req.method = 'OPTIONS';
    cors(req, res, next);
    expect(res.set).to.have.been.calledWith({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,HEAD,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key',
    });
    expect(res.sendStatus).to.have.been.calledWith(200);
    expect(next).to.not.have.been.called;
  });
});
