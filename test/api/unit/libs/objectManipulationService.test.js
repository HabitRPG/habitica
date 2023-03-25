import assert from 'assert';
import ObjectManipulationService from '../../../../website/server/libs/objectManipulationService';

describe('ObjectManipulationService', () => {
  const notAnObjectErrorMessage = /Not an object/;
  describe('Clone Method', () => {
    it('Should clone an object', () => {
      const obj = { a: 1, b: 2 };
      const result = ObjectManipulationService.clone(obj);
      assert.deepEqual(result, obj);
      assert.notStrictEqual(result, obj);
    });

    it('Should throw an error if the argument is not an object', () => {
      assert.throws(() => {
        ObjectManipulationService.clone(null);
      }, notAnObjectErrorMessage);
    });
  });

  describe('Merge Method', () => {
    it('Should merge two objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const result = ObjectManipulationService.merge(obj1, obj2);
      assert.deepEqual(result, {
        a: 1, b: 2, c: 3, d: 4,
      });
    });

    it('Should throw an error if the argument is not an object', () => {
      assert.throws(() => {
        ObjectManipulationService.merge(null, {});
      }, notAnObjectErrorMessage);

      assert.throws(() => {
        ObjectManipulationService.merge({}, null);
      }, notAnObjectErrorMessage);
    });
  });

  describe('Filter By Keys Method', () => {
    it('Should filter an object', () => {
      const obj = {
        a: 1, b: 2, c: 3, d: 4,
      };
      const result = ObjectManipulationService.filterByKeys(obj, ['a', 'c']);
      assert.deepEqual(result, { a: 1, c: 3 });
    });

    it('Should throw an error if the argument is not an object', () => {
      assert.throws(() => {
        ObjectManipulationService.filterByKeys(null, []);
      }, notAnObjectErrorMessage);
    });
  });

  describe('Remove By Keys Method', () => {
    it('Should remove an object', () => {
      const obj = {
        a: 1, b: 2, c: 3, d: 4,
      };
      const result = ObjectManipulationService.removeByKeys(obj, ['a', 'c']);
      assert.deepEqual(result, { b: 2, d: 4 });
    });

    it('Should throw an error if the argument is not an object', () => {
      assert.throws(() => {
        ObjectManipulationService.removeByKeys(null, []);
      }, notAnObjectErrorMessage);
    });
  });
});
