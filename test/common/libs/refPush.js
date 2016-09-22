import shared from '../../../website/common';
import { v4 as generateUUID } from 'uuid';

describe('refPush', () => {
  it('it hashes one object into another by its id', () => {
    let referenceObject = {};
    let objectToHash = {
      a: 1,
      id: generateUUID(),
    };

    shared.refPush(referenceObject, objectToHash);

    expect(referenceObject[objectToHash.id].a).to.equal(objectToHash.a);
    expect(referenceObject[objectToHash.id].id).to.equal(objectToHash.id);
    expect(referenceObject[objectToHash.id].sort).to.equal(0);
  });

  it('it hashes one object into another by a uuid when object does not have an id', () => {
    let referenceObject = {};
    let objectToHash = {
      a: 1,
    };

    shared.refPush(referenceObject, objectToHash);

    let hashedObject = _.find(referenceObject, (hashedItem) => {
      return objectToHash.a === hashedItem.a;
    });

    expect(hashedObject.a).to.equal(objectToHash.a);
    expect(hashedObject.id).to.equal(objectToHash.id);
    expect(hashedObject.sort).to.equal(0);
  });

  it('it hashes one object into another by a id and gives it the highest sort value', () => {
    let referenceObject = {};
    referenceObject[generateUUID()] = { b: 2, sort: 1 };
    let objectToHash = {
      a: 1,
    };

    shared.refPush(referenceObject, objectToHash);

    let hashedObject = _.find(referenceObject, (hashedItem) => {
      return objectToHash.a === hashedItem.a;
    });

    expect(hashedObject.a).to.equal(objectToHash.a);
    expect(hashedObject.id).to.equal(objectToHash.id);
    expect(hashedObject.sort).to.equal(2);
  });
});
