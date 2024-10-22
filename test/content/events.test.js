import { getRepeatingEvents } from '../../website/common/script/content/constants/events';

describe('events', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  it('returns empty array when no events are active', () => {
    clock = sinon.useFakeTimers(new Date('2024-01-08'));
    const events = getRepeatingEvents();
    expect(events).to.be.empty;
  });

  it('returns events when active', () => {
    clock = sinon.useFakeTimers(new Date('2024-01-31'));
    const events = getRepeatingEvents();
    expect(events).to.have.length(1);
    expect(events[0].key).to.equal('birthday');
    expect(events[0].end).to.be.greaterThan(new Date());
    expect(events[0].start).to.be.lessThan(new Date());
  });

  it('returns nye event at beginning of the year', () => {
    clock = sinon.useFakeTimers(new Date('2025-01-01'));
    const events = getRepeatingEvents();
    expect(events).to.have.length(2);
    expect(events[0].key).to.equal('nye');
  });

  it('returns nye event at end of the year', () => {
    clock = sinon.useFakeTimers(new Date('2024-12-30'));
    const events = getRepeatingEvents();
    expect(events).to.have.length(2);
    expect(events[0].key).to.equal('nye');
  });
});
