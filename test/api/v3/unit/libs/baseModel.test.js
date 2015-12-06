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
    expect(sanitized).not.to.have.property('noUpdateForMe');
    expect(sanitized.noUpdateForMe).to.equal(undefined);
  });

  it('accepts an array of additional fields to sanitize at runtime', () => {
    baseModel(schema, {
      noSet: ['noUpdateForMe']
    });

    expect(schema.statics.sanitize).to.exist;
    let sanitized = schema.statics.sanitize({ok: true, noUpdateForMe: true, usuallySettable: true}, ['usuallySettable']);

    expect(sanitized).to.have.property('ok');
    expect(sanitized).not.to.have.property('noUpdateForMe');
    expect(sanitized).not.to.have.property('usuallySettable');
  });


  it('can make fields private', () => {
    baseModel(schema, {
      private: ['amPrivate']
    });

    expect(schema.options.toJSON.transform).to.exist;
    let objToTransform = {ok: true, amPrivate: true};
    let privatized = schema.options.toJSON.transform({}, objToTransform);

    expect(privatized).to.have.property('ok');
    expect(privatized).not.to.have.property('amPrivate');
  });

  it('accepts a further transform function for toJSON', () => {
    let options = {
      private: ['amPrivate'],
      toJSONTransform: sandbox.stub().returns(true)
    };

    baseModel(schema, options);

    let objToTransform = {ok: true, amPrivate: true};
    let privatized = schema.options.toJSON.transform({}, objToTransform);

    expect(privatized).to.equals(true);
    expect(options.toJSONTransform).to.be.calledWith(objToTransform);
  });

  it('accepts a transform function for sanitize', () => {
    let options = {
      private: ['amPrivate'],
      sanitizeTransform: sandbox.stub().returns(true)
    };

    baseModel(schema, options);

    expect(schema.options.toJSON.transform).to.exist;
    let objToSanitize = {ok: true, noUpdateForMe: true};
    let sanitized = schema.statics.sanitize(objToSanitize);

    expect(sanitized).to.equals(true);
    expect(options.sanitizeTransform).to.be.calledWith(objToSanitize);
  });
});
