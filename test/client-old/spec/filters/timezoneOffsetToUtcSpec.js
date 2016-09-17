describe('timezoneOffsetToUtc', function() {

  beforeEach(module('habitrpg'));

  it('formats the timezone offset with a - sign if the offset is positive', inject(function(timezoneOffsetToUtcFilter) {
    expect(timezoneOffsetToUtcFilter(90)).to.eql('UTC-1:30');
  }));

  it('formats the timezone offset with a + sign if the offset is negative', inject(function(timezoneOffsetToUtcFilter) {
    expect(timezoneOffsetToUtcFilter(-525)).to.eql('UTC+8:45');
  }));

  it('prepends the minutes with a 0 if the minute the offset is less than 10', inject(function(timezoneOffsetToUtcFilter) {
    expect(timezoneOffsetToUtcFilter(60)).to.eql('UTC-1:00');
  }));

  it('returns the string UTC+0:00 if the offset is 0', inject(function(timezoneOffsetToUtcFilter) {
    expect(timezoneOffsetToUtcFilter(0)).to.eql('UTC+0:00');
  }));
});
