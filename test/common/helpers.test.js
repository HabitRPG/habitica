import {
  $w,
  countExists,
  refPush,
} from '../../common/script/helpers';

import {
  keys,
  size,
} from 'lodash';

describe('convenience functions', () => {
  describe('$w', () => {
    it('converts a space-delimited string to an array', () => {
      let words = $w('space delimited string');

      expect(words).to.eql(['space', 'delimited', 'string']);
    });
  });

  describe('refPush', () => {
    const UUID = 'identity';
    const ITEM_WITH_UUID = { id: UUID, data: 'abcdef' };
    const UUID_2 = 'uniqueness';

    let testObject = {};

    it('adds an item to the given object', () => {
      refPush(testObject, ITEM_WITH_UUID);
      expect(size(testObject)).to.eql(1);
    });

    it('uses included UUID if supplied', () => {
      expect(testObject[UUID]).to.exist;
    });

    it('includes properties of added item', () => {
      expect(testObject[UUID].id).to.eql(ITEM_WITH_UUID.id);
      expect(testObject[UUID].data).to.eql(ITEM_WITH_UUID.data);
    });

    it('gives first item a sort position of 0', () => {
      expect(testObject[UUID].sort).to.eql(0);
    });

    it('appends additional items', () => {
      refPush(testObject, {});
      expect(size(testObject)).to.eql(2);
    });

    it('assigns a UUID to the newly added item if none was supplied', () => {
      const GENERATED_UUID = keys(testObject)[1];
      const UUID_LENGTH = 36;

      expect(GENERATED_UUID.length).to.eql(UUID_LENGTH);
      expect(testObject[GENERATED_UUID].id).to.eql(GENERATED_UUID);
    });

    it('increments sort position by 1 for each added item', () => {
      const ITEM_WITH_UUID_2 = {id: UUID_2};
      const GENERATED_UUID = keys(testObject)[1];

      refPush(testObject, ITEM_WITH_UUID_2);
      expect(size(testObject)).to.eql(3);
      expect(testObject[GENERATED_UUID].sort).to.eql(1);
      expect(testObject[UUID_2].sort).to.eql(2);
    });

    it('creates a new item and UUID if existing UUID is supplied', () => {
      const ITEM_WITH_UUID_2 = {id: UUID_2, data: 'information'};

      refPush(testObject, ITEM_WITH_UUID_2);
      expect(size(testObject)).to.eql(4);
      expect(testObject[UUID_2].data).to.not.exist;

      const GENERATED_UUID = keys(testObject)[3];

      expect(GENERATED_UUID).to.not.eql(UUID_2);
      expect(testObject[GENERATED_UUID].data).to.eql(ITEM_WITH_UUID_2.data);
    });
  });

  describe('countExists', () => {
    it('counts the truthy values in an object', () => {
      const TEST_COLLECTION = {
        booleanTrue: true,
        booleanFalse: false,
        numericPositive: 8,
        numericZero: 0,
        numericNegative: -3,
        nothing: null,
        emptyString: '',
        fullString: 'stuff',
        object: {id: 338, data: 'info'},
        array: [12, 48, 3939],
      };

      expect(countExists(TEST_COLLECTION)).to.eql(6);
    });
  });
});
