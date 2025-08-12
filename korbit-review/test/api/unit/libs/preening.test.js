import moment from 'moment';
import sinon from 'sinon'; // eslint-disable-line no-shadow
import { preenHistory } from '../../../../website/server/libs/preening';
import { generateHistory } from '../../../helpers/api-unit.helper';

describe('preenHistory', () => {
  let clock;

  beforeEach(() => {
    // Replace system clocks so we can get predictable results
    clock = sinon.useFakeTimers({
      now: Number(moment('2013-10-20').utcOffset(0).startOf('day').toDate()),
      toFake: ['Date'],
    });
  });
  afterEach(() => clock.restore());

  it('does not modify history if all entries are more recent than cutoff (free users)', () => {
    const h = generateHistory(60);
    expect(preenHistory(_.cloneDeep(h), false, 0)).to.eql(h);
  });

  it('does not modify history if all entries are more recent than cutoff (subscribers)', () => {
    const h = generateHistory(365);
    expect(preenHistory(_.cloneDeep(h), true, 0)).to.eql(h);
  });

  it('does aggregate data in monthly entries before cutoff (free users)', () => {
    const h = generateHistory(81); // Jumps to July
    const preened = preenHistory(_.cloneDeep(h), false, 0);
    expect(preened.length).to.eql(62); // Keeps 60 days + 2 entries per august and july
  });

  it('does aggregate data in monthly entries before cutoff (subscribers)', () => {
    const h = generateHistory(396); // Jumps to September 2012
    const preened = preenHistory(_.cloneDeep(h), true, 0);
    expect(preened.length).to.eql(367); // Keeps 365 days + 2 entries per october and september
  });

  it('does aggregate data in monthly and yearly entries before cutoff (free users)', () => {
    const h = generateHistory(731); // Jumps to October 21 2012
    const preened = preenHistory(_.cloneDeep(h), false, 0);
    // Keeps 60 days + 11 montly entries and 2 yearly entry for 2011 and 2012
    expect(preened.length).to.eql(73);
  });

  it('does aggregate data in monthly and yearly entries before cutoff (subscribers)', () => {
    const h = generateHistory(1031); // Jumps to October 21 2012
    const preened = preenHistory(_.cloneDeep(h), true, 0);
    // Keeps 365 days + 13 montly entries and 2 yearly entries for 2011 and 2010
    expect(preened.length).to.eql(380);
  });

  it('correctly aggregates values', () => {
    const h = generateHistory(63); // Compress last 3 days
    const preened = preenHistory(_.cloneDeep(h), false, 0);
    expect(preened[0].value).to.eql((61 + 62 + 63) / 3);
  });
});
