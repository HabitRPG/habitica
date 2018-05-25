import generateStore from 'client/store';
import Store from 'client/libs/store';

describe('Application store', () => {
  it('is an instance of Store', () => {
    expect(generateStore()).to.be.an.instanceof(Store);
  });
});
