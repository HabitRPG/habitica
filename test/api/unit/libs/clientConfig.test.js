import {
  buildClientConfig,
  computeClientConfigVersion,
} from '../../../../website/server/libs/clientConfig';

describe('buildClientConfig', () => {
  const option = values => [{ key: 'k', defaultValue: 'default', values }];
  const resolve = (values, platform, segments = []) => buildClientConfig(
    option(values),
    platform,
    new Set(segments),
  ).k;

  it('uses the default value without matching overrides', () => {
    expect(resolve([], 'web')).to.equal('default');
    expect(resolve(undefined, 'web')).to.equal('default');
    expect(resolve([{ platform: 'ios', value: 'ios' }], 'android')).to.equal('default');
  });

  it('does not apply mobile overrides to web', () => {
    expect(resolve([{ platform: 'mobile', value: 'mobile' }], 'web')).to.equal('default');
    expect(resolve([{ platform: 'mobile', value: 'mobile' }], 'android')).to.equal('mobile');
  });

  it('prefers an exact platform over mobile, regardless of order', () => {
    const values = [{ platform: 'mobile', value: 'mobile' }, { platform: 'ios', value: 'ios' }];
    expect(resolve(values, 'ios')).to.equal('ios');
    expect(resolve([...values].reverse(), 'ios')).to.equal('ios');
  });

  it('ignores overrides for segments the user is not in', () => {
    expect(resolve([{ segment: 's1', value: 'segment' }], 'web', ['s2'])).to.equal('default');
    // a segment override restricted to another platform doesn't apply either
    expect(resolve([{ segment: 's1', platform: 'ios', value: 'x' }], 'web', ['s1'])).to.equal('default');
  });

  it('ranks segment+platform over segment+mobile over segment over platform', () => {
    const values = [
      { platform: 'ios', value: 'platform' },
      { segment: 's1', value: 'segment' },
      { segment: 's1', platform: 'mobile', value: 'segmentMobile' },
      { segment: 's1', platform: 'ios', value: 'segmentIos' },
    ];
    expect(resolve(values, 'ios', ['s1'])).to.equal('segmentIos');
    expect(resolve(values, 'android', ['s1'])).to.equal('segmentMobile');
    expect(resolve(values, 'web', ['s1'])).to.equal('segment');
    expect(resolve(values, 'ios')).to.equal('platform');
  });

  it('uses the first override when two have the same rank', () => {
    const values = [{ segment: 's1', value: 'first' }, { segment: 's2', value: 'second' }];
    expect(resolve(values, 'web', ['s1', 's2'])).to.equal('first');
    expect(resolve([...values].reverse(), 'web', ['s1', 's2'])).to.equal('second');
  });

  it('keeps falsy override values', () => {
    expect(buildClientConfig(
      [{ key: 'k', defaultValue: true, values: [{ platform: 'web', value: false }] }],
      'web',
    ).k).to.equal(false);
    expect(buildClientConfig(
      [{ key: 'k', defaultValue: 5, values: [{ platform: 'web', value: 0 }] }],
      'web',
    ).k).to.equal(0);
  });
});

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

  it('changes when the override order changes, since order breaks ties', () => {
    const values = [...optionA.values].reverse();
    expect(computeClientConfigVersion([{ ...optionA, values }, optionB], [segment1, segment2]))
      .to.not.equal(base);
  });

  it('changes when an override is retargeted', () => {
    const values = [{ platform: 'android', value: 'y' }, optionA.values[1]];
    expect(computeClientConfigVersion([{ ...optionA, values }, optionB], [segment1, segment2]))
      .to.not.equal(base);
  });

  it('changes when the type changes', () => {
    expect(computeClientConfigVersion([optionA, { ...optionB, type: 'text' }], [segment1, segment2]))
      .to.not.equal(base);
  });

  it('ignores ids, timestamps and other fields', () => {
    const withMeta = {
      ...optionA,
      _id: 'id',
      updatedAt: new Date(),
      createdAt: new Date(),
      enabled: true,
      group: 'g',
      values: optionA.values.map((v, i) => ({ ...v, _id: `override${i}` })),
    };
    expect(computeClientConfigVersion([withMeta, optionB], [
      {
        ...segment1, updatedAt: new Date(), color: 'red', description: 'd',
      }, segment2,
    ])).to.equal(base);
  });

  it('distinguishes values that only differ in type', () => {
    expect(computeClientConfigVersion([{ ...optionB, defaultValue: '1' }], []))
      .to.not.equal(computeClientConfigVersion([optionB], []));
  });

  it('handles an empty config', () => {
    expect(computeClientConfigVersion([], [])).to.match(/^[0-9a-f]{12}$/);
  });
});
