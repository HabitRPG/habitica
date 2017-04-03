import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import nconf from 'nconf';
import requireAgain from 'require-again';

describe('maintenance mode middleware', () => {
  let res, req, next;
  let pathToMaintenanceModeMiddleware = '../../../../../website/server/middlewares/maintenanceMode';

  beforeEach(() => {
    res = generateRes();
    next = generateNext();
  });

  it('does not return 503 error when maintenance mode is off', () => {
    req = generateReq();
    sandbox.stub(nconf, 'get').withArgs('MAINTENANCE_MODE').returns('false');
    let attachMaintenanceMode = requireAgain(pathToMaintenanceModeMiddleware);

    attachMaintenanceMode(req, res, next);

    expect(next).to.have.been.called.once;
    expect(res.status).to.not.have.been.called;
  });

  it('returns 503 error when maintenance mode is on', () => {
    req = generateReq();
    sandbox.stub(nconf, 'get').withArgs('MAINTENANCE_MODE').returns('true');
    let attachMaintenanceMode = requireAgain(pathToMaintenanceModeMiddleware);

    attachMaintenanceMode(req, res, next);

    expect(next).to.not.have.been.called;
    expect(res.status).to.have.been.calledOnce;
    expect(res.status).to.have.been.calledWith(503);
  });

  it('renders maintenance page when request type is HTML', () => {
    req = generateReq({headers: {accept: 'text/html'}});
    sandbox.stub(nconf, 'get').withArgs('MAINTENANCE_MODE').returns('true');
    let attachMaintenanceMode = requireAgain(pathToMaintenanceModeMiddleware);

    attachMaintenanceMode(req, res, next);
    expect(res.render).to.have.been.calledOnce;
  });

  it('sends error message when request type is JSON', () => {
    req = generateReq({headers: {accept: 'application/json'}});
    sandbox.stub(nconf, 'get').withArgs('MAINTENANCE_MODE').returns('true');
    let attachMaintenanceMode = requireAgain(pathToMaintenanceModeMiddleware);

    attachMaintenanceMode(req, res, next);
    expect(res.send).to.have.been.calledOnce;
  });
});
