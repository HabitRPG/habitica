import baseModel from '../../../../../website/src/libs/api-v3/baseModel';
import mongoose from 'mongoose';

describe('Base model plugin', () => {
  let schema;

  beforeEach(() => {
    schema = new mongoose.Schema();
    sandbox.stub(schema, 'add');
  });

  it('adds a _id field to the schema', () => {
    schema.plugin(baseModel);

    expect(schema.add).to.be.calledWith(sinon.match({
      _id: sinon.match.object,
    }));
  });

  it('can add timestamps fields', () => {
    schema.plugin(baseModel, {timestamps: true});

    expect(schema.add).to.be.calledTwice;
  });

  it('can sanitize input objects', () => {
    schema.plugin(baseModel, {
      noSet: ['noUpdateForMe'],
    });

    expect(schema.statics.sanitize).to.exist;
    let sanitized = schema.statics.sanitize({ok: true, noUpdateForMe: true});

    expect(sanitized).to.have.property('ok');
    expect(sanitized).not.to.have.property('noUpdateForMe');
    expect(sanitized.noUpdateForMe).to.equal(undefined);
  });

  it('accepts an array of additional fields to sanitize at runtime', () => {
    schema.plugin(baseModel, {
      noSet: ['noUpdateForMe'],
    });

    expect(schema.statics.sanitize).to.exist;
    let sanitized = schema.statics.sanitize({ok: true, noUpdateForMe: true, usuallySettable: true}, ['usuallySettable']);

    expect(sanitized).to.have.property('ok');
    expect(sanitized).not.to.have.property('noUpdateForMe');
    expect(sanitized).not.to.have.property('usuallySettable');
  });


  it('can make fields private', () => {
    schema.plugin(baseModel, {
      private: ['amPrivate'],
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
      toJSONTransform: sandbox.stub().returns(true),
    };

    schema.plugin(baseModel, options);

    let objToTransform = {ok: true, amPrivate: true};
    let privatized = schema.options.toJSON.transform({}, objToTransform);

    expect(privatized).to.equals(true);
    expect(options.toJSONTransform).to.be.calledWith(objToTransform);
  });

  it('accepts a transform function for sanitize', () => {
    let options = {
      private: ['amPrivate'],
      sanitizeTransform: sandbox.stub().returns(true),
    };

    schema.plugin(baseModel, options);

    expect(schema.options.toJSON.transform).to.exist;
    let objToSanitize = {ok: true, noUpdateForMe: true};
    let sanitized = schema.statics.sanitize(objToSanitize);

    expect(sanitized).to.equals(true);
    expect(options.sanitizeTransform).to.be.calledWith(objToSanitize);
  });

  describe('removeFromArray', () => {
    let Model;

    before(() => {
      let removeFromArraySchema = new mongoose.Schema({
        nested: {
          array: {
            type: Array,
          },
        },
        someArray: {
          type: Array,
        },
      });
      removeFromArraySchema.plugin(baseModel);
      Model = mongoose.model('DummyModelForTestingRemoveFromArray', removeFromArraySchema);
    });

    it('adds a removeFromArray function to methods', () => {
      let modelInstance = new Model();

      expect(modelInstance.removeFromArray).to.be.a('function');
    });

    it('removes item from specified array on document', () => {
      let modelInstance = new Model({
        someArray: ['a', 'b', 'c', 'd'],
      });

      modelInstance.removeFromArray('someArray', 'c');

      expect(modelInstance.someArray).to.not.include('c');
    });

    it('removes item from specified array in neste object on document', () => {
      let modelInstance = new Model({
        nested: {
          array: [1, 2, 3, 4, 5],
        },
      });

      modelInstance.removeFromArray('nested.array', 3);
      expect(modelInstance.nested.array).to.not.include(3);
    });

    it('does not change array if value is not found', () => {
      let modelInstance = new Model({
        someArray: ['a', 'b', 'c', 'd'],
      });

      modelInstance.removeFromArray('someArray', 'z');

      expect(modelInstance.someArray).to.have.a.lengthOf(4);
      expect(modelInstance.someArray[0]).to.eql('a');
      expect(modelInstance.someArray[1]).to.eql('b');
      expect(modelInstance.someArray[2]).to.eql('c');
      expect(modelInstance.someArray[3]).to.eql('d');
    });
  });
});
