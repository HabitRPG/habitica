/* eslint-disable global-require */
import nconf from 'nconf';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { NotFound } from '../../../../website/server/libs/errors';
import ensureTimeTravelMode from '../../../../website/server/middlewares/ensureTimeTravelMode';

describe('timetravelMode middleware', () => {
  let res; let req; let next;
  let nconfStub;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
    nconfStub = sandbox.stub(nconf, 'get');
  });

  it('returns not found when using production URL', () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(false);
    nconfStub.withArgs('BASE_URL').returns('https://habitica.com');

    ensureTimeTravelMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('returns not found when not in time travel mode', () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(false);
    nconfStub.withArgs('BASE_URL').returns('http://localhost:3000');

    ensureTimeTravelMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('passes when in time travel mode', () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('http://localhost:3000');

    ensureTimeTravelMode(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
