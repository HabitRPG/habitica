import {
 removeElementFromArray,
} from '../../../../../website/src/libs/api-v3/collectionManipulators';

describe('Collection Manipulators', () => {
  describe('removeElementFromArray', () => {
    it('removes item from specified array on document', () => {
      let array = ['a', 'b', 'c', 'd'];

      removeElementFromArray(array, 'c');

      expect(array).to.not.include('c');
    });

    it('removes object from array', () => {
      let array = [
        { id: 'a', foo: 'bar' },
        { id: 'b', foo: 'bar' },
        { id: 'c', foo: 'bar' },
        { id: 'd', foo: 'bar' },
        { id: 'e', foo: 'bar' },
      ];

      removeElementFromArray(array, { id: 'c' });

      expect(array).to.not.include({ id: 'c', foo: 'bar' });
    });

    it('does not change array if value is not found', () => {
      let array = ['a', 'b', 'c', 'd'];

      removeElementFromArray(array, 'z');

      expect(array).to.have.a.lengthOf(4);
      expect(array[0]).to.eql('a');
      expect(array[1]).to.eql('b');
      expect(array[2]).to.eql('c');
      expect(array[3]).to.eql('d');
    });

    it('returns the removed element', () => {
      let array = ['a', 'b', 'c'];

      let result = removeElementFromArray(array, 'b');

      expect(result).to.eql('b');
    });

    it('returns the removed object element', () => {
      let array = [
        { id: 'a', foo: 'bar' },
        { id: 'b', foo: 'bar' },
        { id: 'c', foo: 'bar' },
        { id: 'd', foo: 'bar' },
        { id: 'e', foo: 'bar' },
      ];

      let result = removeElementFromArray(array, { id: 'c' });

      expect(result).to.eql({ id: 'c', foo: 'bar' });
    });

    it('returns false if item is not found', () => {
      let array = ['a', 'b', 'c'];

      let result = removeElementFromArray(array, 'z');

      expect(result).to.eql(false);
    });
  });
});
