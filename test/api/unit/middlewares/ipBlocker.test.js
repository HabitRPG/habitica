import nconf from 'nconf';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { Forbidden } from '../../../../website/server/libs/errors';
import apiError from '../../../../website/server/libs/apiError';

function checkErrorThrown (next) {
  expect(next).to.have.been.calledOnce;
  const calledWith = next.getCall(0).args;
  expect(calledWith[0].message).to.equal(apiError('ipAddressBlocked'));
  expect(calledWith[0] instanceof Forbidden).to.equal(true);
}

function checkErrorNotThrown (next) {
  expect(next).to.have.been.calledOnce;
  const calledWith = next.getCall(0).args;
  expect(typeof calledWith[0] === 'undefined').to.equal(true);
}

describe('ipBlocker middleware', () => {
  const pathToIpBlocker = '../../../../website/server/middlewares/ipBlocker';

  let res; let req; let next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('is disabled when the env var is not defined', () => {
    sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns(undefined);
    const attachIpBlocker = requireAgain(pathToIpBlocker).default;
    attachIpBlocker(req, res, next);

    checkErrorNotThrown(next);
  });

  it('is disabled when the env var is an empty string', () => {
    sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('');
    const attachIpBlocker = requireAgain(pathToIpBlocker).default;
    attachIpBlocker(req, res, next);

    checkErrorNotThrown(next);
  });

  it('is disabled when the env var contains comma separated empty strings', () => {
    sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns(' , , ');
    const attachIpBlocker = requireAgain(pathToIpBlocker).default;
    attachIpBlocker(req, res, next);

    checkErrorNotThrown(next);
  });

  it('does not throw when the ip does not match', () => {
    req.ip = '192.168.1.1';
    sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('192.168.1.2');
    const attachIpBlocker = requireAgain(pathToIpBlocker).default;
    attachIpBlocker(req, res, next);

    checkErrorNotThrown(next);
  });

  it('throws when the ip is blocked', () => {
    req.ip = '192.168.1.1';
    sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('192.168.1.1');
    const attachIpBlocker = requireAgain(pathToIpBlocker).default;
    attachIpBlocker(req, res, next);

    checkErrorThrown(next);
  });
});
