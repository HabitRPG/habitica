/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import ensureDevelpmentMode from '../../../../../website/server/middlewares/ensureDevelpmentMode';
import { NotFound } from '../../../../../website/server/libs/errors';
import nconf from 'nconf';

describe('developmentMode middleware', () => {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('returns not found when in production mode', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(true);

    ensureDevelpmentMode(req, res, next);

    expect(next).to.be.calledWith(new NotFound());
  });

  it('passes when not in production', () => {
    sandbox.stub(nconf, 'get').withArgs('IS_PROD').returns(false);

    ensureDevelpmentMode(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
