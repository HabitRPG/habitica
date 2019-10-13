import Store from '@/libs/store';
import generateStore from '@/store';

describe('Application store', () => {
  it('is an instance of Store', () => {
    expect(generateStore()).to.be.an.instanceof(Store);
  });
});
