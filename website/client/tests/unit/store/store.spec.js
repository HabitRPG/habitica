import generateStore from '@/store';
import Store from '@/libs/store';

describe('Application store', () => {
  it('is an instance of Store', () => {
    expect(generateStore()).to.be.an.instanceof(Store);
  });
});
