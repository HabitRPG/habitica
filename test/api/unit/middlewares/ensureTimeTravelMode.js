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
  let res; let req; let
    next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('returns not found when not in time travel mode', () => {
    sandbox.stub(nconf, 'get').withArgs('ENABLE_TIME_TRAVEL').returns(false);

    ensureTimeTravelMode(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('passes when in time travel mode', () => {
    sandbox.stub(nconf, 'get').withArgs('ENABLE_TIME_TRAVEL').returns(true);

    ensureTimeTravelMode(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
