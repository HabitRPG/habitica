import {
  $w,
  refPush,
} from '../../common/script/index';

import {
  keys,
  size,
} from 'lodash';

describe('convenience functions', () => {
  
  describe('$w', () => {
    it('converts a space-delimited string to an array', () => {
      expect($w('space delimited string')).to.eql(['space','delimited','string']);
    });
  });

  describe('uuid', () => {

  });

  describe('refPush', () => {
    let testObject = {};
    const UUID = 'identity';
    const ITEM_WITH_UUID = {id: UUID, data: 'abcdef'};
    const ITEM_NO_UUID = {};
    const UUID_LENGTH = 36;

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
      refPush(testObject, ITEM_NO_UUID);
      expect(size(testObject)).to.eql(2);
    });

    it('assigns a UUID to the newly added item if none was supplied', () => {
      const TEST_KEYS = keys(testObject);
      expect(TEST_KEYS[1].length).to.eql(UUID_LENGTH);
      const KEY_1 = TEST_KEYS[1];
      expect(testObject[KEY_1].id).to.eql(KEY_1);
    });

    it('increments sort position by 1 for each added item', () => {
      const ITEM_WITH_UUID_2 = {id: UUID + '2'};
      refPush(testObject, ITEM_WITH_UUID_2);
      const TEST_KEYS = keys(testObject);
      const KEY_1 = TEST_KEYS[1];
      const KEY_2 = TEST_KEYS[2];
      expect(testObject[KEY_1].sort).to.eql(1);
      expect(testObject[KEY_2].sort).to.eql(2);
    });
  });
});
