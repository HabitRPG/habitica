import nconf from 'nconf';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { NotFound } from '../../../../website/server/libs/errors';
import { ensureAdminPanelEnabled } from '../../../../website/server/middlewares/ensureAdminPanelEnabled';

describe('ensureAdminPanelEnabled middleware', () => {
  let res; let req; let next;
  let nconfStub;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
    nconfStub = sandbox.stub(nconf, 'get');
  });

  it('returns not found when the admin panel is not configured', () => {
    nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns(undefined);

    ensureAdminPanelEnabled(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('returns not found when the admin panel is disabled', () => {
    nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns('false');

    ensureAdminPanelEnabled(req, res, next);

    const calledWith = next.getCall(0).args;
    expect(calledWith[0] instanceof NotFound).to.equal(true);
  });

  it('passes when the admin panel is enabled', () => {
    nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns('true');

    ensureAdminPanelEnabled(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });

  it('passes when the admin panel is enabled with a boolean', () => {
    nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns(true);

    ensureAdminPanelEnabled(req, res, next);

    expect(next).to.be.calledOnce;
    expect(next.args[0]).to.be.empty;
  });
});
