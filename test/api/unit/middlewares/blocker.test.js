import nconf from 'nconf';
import requireAgain from 'require-again';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { Forbidden } from '../../../../website/server/libs/errors';
import { apiError } from '../../../../website/server/libs/apiError';
import { model as Blocker } from '../../../../website/server/models/blocker';

function checkIPBlockedErrorThrown (next) {
  expect(next).to.have.been.calledOnce;
  const calledWith = next.getCall(0).args;
  expect(calledWith[0].message).to.equal(apiError('ipAddressBlocked'));
  expect(calledWith[0] instanceof Forbidden).to.equal(true);
}

function checkClientBlockedErrorThrown (next) {
  expect(next).to.have.been.calledOnce;
  const calledWith = next.getCall(0).args;
  expect(calledWith[0].message).to.equal(apiError('clientBlocked'));
  expect(calledWith[0] instanceof Forbidden).to.equal(true);
}

function checkErrorNotThrown (next) {
  expect(next).to.have.been.calledOnce;
  const calledWith = next.getCall(0).args;
  expect(typeof calledWith[0] === 'undefined').to.equal(true);
}

describe('Blocker middleware', () => {
  const pathToBlocker = '../../../../website/server/middlewares/blocker';

  let res; let req; let next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  describe('Blocking IPs', () => {
    it('is disabled when the env var is not defined', () => {
      sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns(undefined);
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('is disabled when the env var is an empty string', () => {
      sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('');
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('is disabled when the env var contains comma separated empty strings', () => {
      sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns(' , , ');
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when the ip does not match', () => {
      req.ip = '192.168.1.1';
      sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('192.168.1.2');
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when the blocker IP does not match', async () => {
      req.ip = '192.168.1.1';
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'ipaddress', area: 'full', value: '192.168.1.2' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when a client is blocked', async () => {
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'client', area: 'full', value: '192.168.1.1' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('throws when the blocker IP is blocked', async () => {
      req.ip = '192.168.1.1';
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'ipaddress', area: 'full', value: '192.168.1.1' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkIPBlockedErrorThrown(next);
    });
  });

  describe('Blocking clients', () => {
    beforeEach(() => {
      sandbox.stub(nconf, 'get').withArgs('BLOCKED_IPS').returns('');
      req.headers['x-client'] = 'test-client';
    });
    it('is disabled when no clients are blocked', () => {
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when the client does not match', async () => {
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'client', area: 'full', value: 'another-client' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('throws when the client is blocked', async () => {
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'client', area: 'full', value: 'test-client' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkClientBlockedErrorThrown(next);
    });

    it('does not throw when an ip is blocked', async () => {
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'ipaddress', area: 'full', value: 'test-client' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('updates the list when data changes', async () => {
      let blockCallback;
      sandbox.stub(Blocker, 'watchBlockers').returns({
        on: (event, callback) => {
          blockCallback = callback;
          if (event === 'change') {
            callback({ operation: 'add', blocker: { type: 'client', area: 'full', value: 'another-client' } });
          }
        },
      });
      const attachBlocker = requireAgain(pathToBlocker).default;
      attachBlocker(req, res, next);
      checkErrorNotThrown(next);
      blockCallback({ operation: 'add', blocker: { type: 'client', area: 'full', value: 'test-client' } });
      attachBlocker(req, res, next);
      expect(next).to.have.been.calledTwice;
      const calledWith = next.getCall(1).args;
      expect(calledWith[0].message).to.equal(apiError('clientBlocked'));
      expect(calledWith[0] instanceof Forbidden).to.equal(true);
    });
  });
});
