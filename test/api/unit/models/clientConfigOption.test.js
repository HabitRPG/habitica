import { model as ClientConfigOption } from '../../../../website/server/models/clientConfigOption';

describe('ClientConfigOption model', () => {
  const validationErrors = option => {
    const error = new ClientConfigOption({ name: 'Name', key: 'key', ...option }).validateSync();
    return error ? Object.keys(error.errors) : [];
  };

  describe('sanitize', () => {
    it('converts number values', () => {
      expect(ClientConfigOption.sanitize({
        type: 'number', defaultValue: '5', values: [{ platform: 'ios', value: '0' }],
      })).to.eql({ type: 'number', defaultValue: 5, values: [{ platform: 'ios', value: 0 }] });
    });

    it('rejects blank or non-numeric numbers instead of storing 0 or NaN', () => {
      ['', 'abc', null, undefined, 'Infinity'].forEach(input => {
        const sanitized = ClientConfigOption.sanitize({
          type: 'number', defaultValue: input, values: [{ platform: 'ios', value: input }],
        });
        expect(validationErrors(sanitized)).to.include.members(['defaultValue', 'values.0.value']);
      });
    });

    it('converts boolean values from strings', () => {
      expect(ClientConfigOption.sanitize({
        type: 'boolean', defaultValue: 'false', values: [{ platform: 'ios', value: 'true' }],
      })).to.eql({ type: 'boolean', defaultValue: false, values: [{ platform: 'ios', value: true }] });
    });

    it('rejects invalid json', () => {
      const sanitized = ClientConfigOption.sanitize({
        type: 'json', defaultValue: '{ not json', values: [{ platform: 'ios', value: '[1,' }],
      });
      expect(validationErrors(sanitized)).to.include.members(['defaultValue', 'values.0.value']);
    });

    it('stores json objects as strings', () => {
      expect(ClientConfigOption.sanitize({ type: 'json', defaultValue: { a: 1 } }).defaultValue)
        .to.be.a('string');
    });

    it('removes empty targets from overrides', () => {
      expect(ClientConfigOption.sanitize({
        type: 'text', defaultValue: 'a', values: [{ platform: '', segment: 's', value: 'b' }],
      }).values).to.eql([{ segment: 's', value: 'b' }]);
    });

    it('strips timestamps and _id', () => {
      expect(ClientConfigOption.sanitize({
        type: 'text', createdAt: 1, updatedAt: 1, _id: 'x',
      }))
        .to.eql({ type: 'text' });
    });
  });

  describe('validation', () => {
    it('accepts falsy but valid default values', () => {
      expect(validationErrors({ type: 'number', defaultValue: 0 })).to.eql([]);
      expect(validationErrors({ type: 'boolean', defaultValue: false })).to.eql([]);
    });

    it('requires overrides to target a platform or a segment', () => {
      expect(validationErrors({ type: 'text', defaultValue: 'a', values: [{ value: 'b' }] }))
        .to.include('values');
    });

    it('requires an alphanumeric key', () => {
      expect(validationErrors({ type: 'text', defaultValue: 'a', key: 'with-dash' })).to.include('key');
      expect(validationErrors({ type: 'text', defaultValue: 'a', key: 'with_underscore' })).to.include('key');
    });

    it('rejects values that do not match the type', () => {
      expect(validationErrors({ type: 'text', defaultValue: { a: 1 } })).to.include('defaultValue');
      expect(validationErrors({ type: 'email', defaultValue: 'nope', values: [{ platform: 'ios', value: 'a@b.co' }] }))
        .to.eql(['defaultValue']);
      expect(validationErrors({ type: 'url', defaultValue: 'https://habitica.com', values: [{ platform: 'ios', value: 'nope' }] }))
        .to.eql(['values.0.value']);
      expect(validationErrors({ type: 'date', defaultValue: '2026-13-45' })).to.include('defaultValue');
    });

    it('accepts valid and blank string values', () => {
      expect(validationErrors({ type: 'email', defaultValue: '' })).to.eql([]);
      expect(validationErrors({ type: 'url', defaultValue: 'habitica://tasks' })).to.eql([]);
      expect(validationErrors({ type: 'date', defaultValue: '2026-11-24' })).to.eql([]);
    });

    it('rejects unknown types and platforms', () => {
      expect(validationErrors({ type: 'color', defaultValue: 'a' })).to.include('type');
      expect(validationErrors({ type: 'text', defaultValue: 'a', values: [{ platform: 'windows', value: 'b' }] }))
        .to.include('values.0.platform');
    });
  });
});
