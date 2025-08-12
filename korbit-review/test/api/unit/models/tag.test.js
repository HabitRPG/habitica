import { model as Tag } from '../../../../website/server/models/tag';

describe('Tag Model', () => {
  context('cleanupCorruptData', () => {
    it('converts an array of tags to a safe version', () => {
      const tags = [
        null, // invalid, not an object
        { name: '123' }, // invalid, no id
        { id: '123' }, // invalid, no name
        new Tag({ name: 'ABC', id: 123 }), // valid
      ];

      const safetags = Tag.cleanupCorruptData(tags);
      expect(safetags.length).to.equal(1);
      expect(safetags[0].name).to.equal('ABC');
      expect(safetags[0].id).to.equal('123');
    });
  });
});
