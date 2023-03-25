class ObjectManipulationService {
  static clone (obj) {
    if (!(obj instanceof Object)) {
      throw new Error('Not an object');
    }
    return { ...obj };
  }

  static merge (obj1, obj2) {
    if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
      throw new Error('Not an object');
    }
    return { ...obj1, ...obj2 };
  }

  static filterByKeys (obj, keys) {
    if (!(obj instanceof Object)) {
      throw new Error('Not an object');
    }
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => keys.includes(key)),
    );
  }

  static removeByKeys (obj, keys) {
    if (!(obj instanceof Object)) {
      throw new Error('Not an object');
    }
    const newObj = { ...obj };
    keys.forEach(key => {
      delete newObj[key];
    });
    return newObj;
  }
}

export default ObjectManipulationService;
