import { describe, expect, test } from 'vitest';
import Store from '@/libs/store';
import generateStore from '@/store';

describe('Application store', () => {
  test('is an instance of Store', () => {
    expect(generateStore()).to.be.an.instanceof(Store);
  });
});
