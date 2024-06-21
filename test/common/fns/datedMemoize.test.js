/* eslint-disable global-require */
import { expect } from 'chai';
import nconf from 'nconf';

const SWITCHOVER_TIME = nconf.get('CONTENT_SWITCHOVER_TIME_OFFSET') || 0;

describe('datedMemoize', () => {
  it('should return a function that returns a function', () => {
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(() => {});
    expect(memoized).to.be.a('function');
  });

  it('should not call multiple times', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized(1, 2);
    memoized(1, 3);
    expect(stub).to.have.been.calledOnce;
  });

  it('call multiple times for different identifiers', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized({ identifier: 'a', memoizeConfig: true }, 1, 2);
    memoized({ identifier: 'b', memoizeConfig: true }, 1, 2);
    expect(stub).to.have.been.calledTwice;
  });

  it('call once for the same identifier', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized({ identifier: 'a', memoizeConfig: true }, 1, 2);
    memoized({ identifier: 'a', memoizeConfig: true }, 1, 2);
    expect(stub).to.have.been.calledOnce;
  });

  it('call once on the same day', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized({ date: new Date('2024-01-01'), memoizeConfig: true }, 1, 2);
    memoized({ date: new Date('2024-01-01'), memoizeConfig: true }, 1, 2);
    expect(stub).to.have.been.calledOnce;
  });

  it('call multiple times on different days', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized({ date: new Date('2024-01-01'), memoizeConfig: true }, 1, 2);
    memoized({ date: new Date('2024-01-02'), memoizeConfig: true }, 1, 2);
    expect(stub).to.have.been.calledTwice;
  });

  it('respects switchover time', () => {
    const stub = sandbox.stub().returns({});
    const datedMemoize = require('../../../website/common/script/fns/datedMemoize').default;
    const memoized = datedMemoize(stub);
    memoized({ date: new Date('2024-01-01T00:00:00.000Z'), memoizeConfig: true }, 1, 2);
    memoized({ date: new Date(`2024-01-01T${String(SWITCHOVER_TIME).padStart(2, '0')}`), memoizeConfig: true }, 1, 2);
    expect(stub).to.have.been.calledTwice;
  });
});
