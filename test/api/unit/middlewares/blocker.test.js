import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { Forbidden } from '../../../../website/server/libs/errors';
import { apiError } from '../../../../website/server/libs/apiError';
import { model as Blocker } from '../../../../website/server/models/blocker';
import { reloadBlockersNow } from '../../../../website/server/libs/blockers';
import ipBlocker from '../../../../website/server/middlewares/blocker';

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

async function setBlockers (blockers) {
  const stub = sandbox.stub(Blocker, 'find').returns({
    select: () => ({ lean: () => ({ exec: async () => blockers }) }),
  });
  await reloadBlockersNow();
  stub.restore();
}

describe('Blocker middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  afterEach(async () => {
    await setBlockers([]);
  });

  describe('Blocking IPs', () => {
    beforeEach(() => {
      req.ip = '192.168.1.1';
    });

    it('does not throw when nothing is blocked', async () => {
      await setBlockers([]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when the blocker IP does not match', async () => {
      await setBlockers([{ type: 'ipaddress', value: '192.168.1.2' }]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when a client with the same value is blocked', async () => {
      await setBlockers([{ type: 'client', value: '192.168.1.1' }]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('throws when the blocker IP is blocked', async () => {
      await setBlockers([{ type: 'ipaddress', value: '192.168.1.1' }]);
      ipBlocker(req, res, next);

      checkIPBlockedErrorThrown(next);
    });
  });

  describe('Blocking clients', () => {
    beforeEach(() => {
      req.headers['x-client'] = 'test-client';
    });

    it('does not throw when no clients are blocked', async () => {
      await setBlockers([]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('does not throw when the client does not match', async () => {
      await setBlockers([{ type: 'client', value: 'another-client' }]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('throws when the client is blocked', async () => {
      await setBlockers([{ type: 'client', value: 'test-client' }]);
      ipBlocker(req, res, next);

      checkClientBlockedErrorThrown(next);
    });

    it('does not throw when an ip with the same value is blocked', async () => {
      await setBlockers([{ type: 'ipaddress', value: 'test-client' }]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });

    it('updates the list when data changes', async () => {
      await setBlockers([{ type: 'client', value: 'another-client' }]);
      ipBlocker(req, res, next);
      checkErrorNotThrown(next);

      await setBlockers([{ type: 'client', value: 'test-client' }]);
      ipBlocker(req, res, next);
      expect(next).to.have.been.calledTwice;
      const calledWith = next.getCall(1).args;
      expect(calledWith[0].message).to.equal(apiError('clientBlocked'));
    });

    it('unblocks a client when its blocker is removed', async () => {
      await setBlockers([{ type: 'client', value: 'test-client' }]);
      await setBlockers([]);
      ipBlocker(req, res, next);

      checkErrorNotThrown(next);
    });
  });
});
