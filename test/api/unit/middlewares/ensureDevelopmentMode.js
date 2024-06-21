/* eslint-disable global-require */
import nconf from 'nconf';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import ensureDevelopmentMode from '../../../../website/server/middlewares/ensureDevelopmentMode';
import { NotFound } from '../../../../website/server/libs/errors';

describe('developmentMode middleware', () => {
  let res; let req; let next;
  let nconfStub;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
    nconfStub = sandbox.stub(nconf, 'get');
  });

  it('returns not found when on production URL', () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('https://habitica.com');

    ensureDevelopmentMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('returns not found when intentionally disabled', () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);
    nconfStub.withArgs('BASE_URL').returns('http://localhost:3000');

    ensureDevelopmentMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('passes when enabled and on non-production URL', () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('http://localhost:3000');

    ensureDevelopmentMode(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
