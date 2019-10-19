/* eslint-disable global-require */
import nconf from 'nconf';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import ensureDevelpmentMode from '../../../../website/server/middlewares/ensureDevelpmentMode';
import { NotFound } from '../../../../website/server/libs/errors';

describe('developmentMode middleware', () => {
  let res; let req; let
    next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('returns not found when in production mode', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);

    ensureDevelpmentMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('passes when not in production', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);

    ensureDevelpmentMode(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
