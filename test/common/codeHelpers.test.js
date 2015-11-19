import {
  $w,
  dotSet,
  dotGet,
} from '../../common/script/index';

describe.only('convenience functions for code streamlining', () => {
  
  describe('$w', () => {
    it('converts a space-delimited string to an array', () => {
      expect($w('space delimited string')).to.eql(['space','delimited','string']);
    });
  });

  describe('dotGet', () => {
    it('returns a property value of an object from a given path', () => {
      const OBJECT = {a: {aa: 1, ab: {aba: 2, abb: 3}}};
      expect(dotGet(OBJECT, 'a.aa')).to.eql(1);
      expect(dotGet(OBJECT, 'a.ab.abb')).to.eql(3);
    });
  });

  describe('dotSet', () => {
    it('sets the property of an object at a path to a value', () => {
      let OBJECT = {
        a: {
          aa: 1, 
          ab: {
            aba: 2,
            abb: 3
          }
        }
      };
      dotSet(OBJECT, 'a.aa', 10);
      expect(OBJECT).to.eql({a: {aa: 10, ab: {aba: 2, abb: 3}}});
      dotSet(OBJECT, 'a.ab.aba', 7);
      expect(OBJECT).to.eql({a: {aa: 10, ab: {aba: 7, abb: 3}}});
    });
  });
});
