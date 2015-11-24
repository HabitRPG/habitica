import baseModel from '../../../../../website/src/libs/api-v3/baseModel';

describe('Base model plugin', () => {
  let schema = {
    add () {
      return true;
    },
    statics: {},
    options: {},
    pre () {
      return true;
    },
  };

  beforeEach(() => {
    sandbox.stub(schema, 'add');
  });

  it('adds a _id field to the schema', () => {
    baseModel(schema);

    expect(schema.add).to.be.calledWith(sinon.match({
      _id: sinon.match.object,
    }));
  });

  it('can add timestamps fields', () => {
    baseModel(schema, {timestamps: true});

    expect(schema.add).to.be.calledTwice;
  });

  it('can sanitize input objects', () => {
    baseModel(schema, {
      noSet: ['noUpdateForMe']
    });

    expect(schema.statics.sanitize).to.exist;
    let sanitized = schema.statics.sanitize({ok: true, noUpdateForMe: true});

    expect(sanitized).to.have.property('ok');
    expect(sanitized).to.have.property('noUpdateForMe');
    expect(sanitized.noUpdateForMe).to.equal(undefined);
  });

  it('can make fields private', () => {
    baseModel(schema, {
      private: ['amPrivate']
    });

    expect(schema.options.toObject.transform).to.exist;
    let objToTransform = {ok: true, amPrivate: true};
    let privatized = schema.options.toObject.transform({}, objToTransform);

    expect(objToTransform).to.have.property('ok');
    expect(objToTransform).to.have.property('amPrivate');
    expect(objToTransform.amPrivate).to.equal(undefined);
  });
});
