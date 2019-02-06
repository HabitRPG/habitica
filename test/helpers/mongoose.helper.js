import mongoose from 'mongoose';

export async function mockFindById (response) {
  const mockFind = {
    select () {
      return this;
    },
    lean () {
      return this;
    },
    exec () {
      return Promise.resolve(response);
    },
  };
  sinon.stub(mongoose.Model, 'findById').returns(mockFind);
}

export function restoreFindById () {
  return mongoose.Model.findById.restore();
}
