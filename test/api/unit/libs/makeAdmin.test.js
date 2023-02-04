import makeAdmin from '../../../../website/client/src/libs/makeAdmin';

// const item = {
//   text: 'You are now admin',
//   success: true,
// };

// eslint-disable-next-line mocha/no-exclusive-tests
describe('Make Admin Notification', () => {
  beforeEach(() => { console.clear(); });
  // eslint-disable-next-line mocha/no-exclusive-tests
  it('function notify returns item', () => {
    const item = 2;
    expect(makeAdmin.notify(item)).to.eql(item);
  });
  // eslint-disable-next-line mocha/no-exclusive-tests
  it('function notify returns error', () => {
    let item;
    expect(makeAdmin.notify(item)).to.eql('noData');
  });
  // eslint-disable-next-line mocha/no-exclusive-tests
  it('function prints in console a text given', () => {
    const consoleSpy = sandbox.spy(console, 'log');
    const item = {
      text: 'Hello World',
      success: true,
    };
    makeAdmin.notify(item);
    expect(consoleSpy).to.be.calledOnce;
    expect(consoleSpy).to.be.calledWith('Hello World');
  });
  // eslint-disable-next-line mocha/no-exclusive-tests
  it('function prints fail if success is false', () => {
    const consoleSpy = sandbox.spy(console, 'log');
    const item = {
      text: 'Hello World',
      success: false,
    };
    makeAdmin.notify(item);
    expect(consoleSpy).to.be.calledWith('Fail to complete');
  });
});

// eslint-disable-next-line mocha/no-exclusive-tests
// it.only('notify recive item', () => {
//   expect(makeAdmin.notify(item).to.eql(item));
// });
