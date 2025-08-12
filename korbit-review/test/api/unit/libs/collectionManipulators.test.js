import mongoose from 'mongoose';
import {
  removeFromArray,
} from '../../../../website/server/libs/collectionManipulators';

describe('Collection Manipulators', () => {
  describe('removeFromArray', () => {
    it('removes element from array', () => {
      const array = ['a', 'b', 'c', 'd'];

      removeFromArray(array, 'c');

      expect(array).to.not.include('c');
    });

    it('removes object from array', () => {
      const array = [
        { id: 'a', foo: 'bar' },
        { id: 'b', foo: 'bar' },
        { id: 'c', foo: 'bar' },
        { id: 'd', foo: 'bar' },
        { id: 'e', foo: 'bar' },
      ];

      removeFromArray(array, { id: 'c' });

      expect(array).to.not.include({ id: 'c', foo: 'bar' });
    });

    it('does not change array if value is not found', () => {
      const array = ['a', 'b', 'c', 'd'];

      removeFromArray(array, 'z');

      expect(array).to.have.a.lengthOf(4);
      expect(array[0]).to.eql('a');
      expect(array[1]).to.eql('b');
      expect(array[2]).to.eql('c');
      expect(array[3]).to.eql('d');
    });

    it('returns the removed element', () => {
      const array = ['a', 'b', 'c'];

      const result = removeFromArray(array, 'b');

      expect(result).to.eql('b');
    });

    it('returns the removed object element', () => {
      const array = [
        { id: 'a', foo: 'bar' },
        { id: 'b', foo: 'bar' },
        { id: 'c', foo: 'bar' },
        { id: 'd', foo: 'bar' },
        { id: 'e', foo: 'bar' },
      ];

      const result = removeFromArray(array, { id: 'c' });

      expect(result).to.eql({ id: 'c', foo: 'bar' });
    });

    it('returns false if item is not found', () => {
      const array = ['a', 'b', 'c'];

      const result = removeFromArray(array, 'z');

      expect(result).to.eql(false);
    });

    it('persists removal of element when mongoose document is saved', async () => {
      const schema = new mongoose.Schema({
        array: Array,
      });
      const Model = mongoose.model('ModelToTestRemoveFromArray', schema);
      const model = await new Model({
        array: ['a', 'b', 'c'],
      }).save(); // Initial creation

      removeFromArray(model.array, 'b');

      const savedModel = await model.save();

      expect(savedModel.array).to.not.include('b');
    });
  });
});
