import { preenHistory } from '../../common/script/preenUserHistory';
import moment from 'moment';
import sinon from 'sinon'; // eslint-disable-line no-shadow

function generateHistory (days) {
  let history = [];
  let now = Number(moment().toDate());

  while (days > 0) {
    history.push({
      value: days,
      date: Number(moment(now).subtract(days, 'days').toDate()),
    });
    days--;
  }

  return history;
}

describe('preenHistory', () => {
  let clock;

  beforeEach(() => {
    // Replace system clocks so we can get predictable results
    clock = sinon.useFakeTimers(Number(moment('2013-10-20').zone(0).startOf('day').toDate()), 'Date');
  });
  afterEach(() => {
    return clock.restore();
  });

  it('does not modify history if all entries are more recent than cutoff (free users)', () => {
    let h = generateHistory(60);
    expect(preenHistory(_.cloneDeep(h))).to.eql(h);
  });

  it('does not modify history if all entries are more recent than cutoff (subscribers)', () => {
    let h = generateHistory(365);
    expect(preenHistory(_.cloneDeep(h), true)).to.eql(h);
  });

  it('does aggregate data in monthly entries before cutoff (free users)', () => {
    let h = generateHistory(81); // Jumps to July
    let preened = preenHistory(_.cloneDeep(h));
    expect(preened.length).to.eql(62); // Keeps 60 days + 2 entries per august and july
  });

  it('does aggregate data in monthly entries before cutoff (subscribers)', () => {
    let h = generateHistory(386); // Jumps to July
    let preened = preenHistory(_.cloneDeep(h), true);
    expect(preened.length).to.eql(367); // Keeps 367 days + 2 entries per august and july
  });

  xit('does aggregate data in monthly and yearly entries before cutoff (free users)', () => {
    let h = generateHistory(731); // Jumps to October 21 2012
    let preened = preenHistory(_.cloneDeep(h), true);
    expect(preened.length).to.eql(368); // Keeps 60 days + 10 montly entries and 1 yearly entry for Oct 21 - Oct 31 2012
  });
});
