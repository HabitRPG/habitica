import { computeClientConfigVersion } from '../../../../website/server/libs/clientConfig';

describe('computeClientConfigVersion', () => {
  const optionA = {
    key: 'a',
    type: 'text',
    name: 'A',
    description: 'First',
    defaultValue: 'x',
    values: [{ platform: 'ios', value: 'y' }, { segment: 's1', value: 'z' }],
  };
  const optionB = {
    key: 'b', type: 'number', name: 'B', defaultValue: 1, values: [],
  };
  const segment1 = { _id: 's1', name: 'S1', conditions: [{ attribute: 'level', operator: 'gte', value: 10 }] };
  const segment2 = { _id: 's2', name: 'S2', conditions: [] };
  const base = computeClientConfigVersion([optionA, optionB], [segment1, segment2]);

  it('returns a 12 character hex string', () => {
    expect(base).to.match(/^[0-9a-f]{12}$/);
  });

  it('does not depend on query order', () => {
    expect(computeClientConfigVersion([optionB, optionA], [segment2, segment1])).to.equal(base);
  });

  it('ignores name and description', () => {
    expect(computeClientConfigVersion(
      [{ ...optionA, name: 'Renamed', description: 'Changed' }, optionB],
      [{ ...segment1, name: 'Renamed' }, segment2],
    )).to.equal(base);
  });

  it('changes when a default value changes', () => {
    expect(computeClientConfigVersion([{ ...optionA, defaultValue: 'other' }, optionB], [segment1, segment2]))
      .to.not.equal(base);
  });

  it('changes when an override changes', () => {
    const values = [{ platform: 'ios', value: 'changed' }, optionA.values[1]];
    expect(computeClientConfigVersion([{ ...optionA, values }, optionB], [segment1, segment2]))
      .to.not.equal(base);
  });

  it('changes when a segment condition changes', () => {
    const changed = { ...segment1, conditions: [{ attribute: 'level', operator: 'gte', value: 20 }] };
    expect(computeClientConfigVersion([optionA, optionB], [changed, segment2])).to.not.equal(base);
  });

  it('changes when an option is enabled or disabled', () => {
    expect(computeClientConfigVersion([optionA], [segment1, segment2])).to.not.equal(base);
  });
});
