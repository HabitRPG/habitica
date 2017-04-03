import {
  maxHealth,
  maxLevel,
  capByLevel,
  tnl,
  diminishingReturns,
} from '../../website/common/script/index';

describe('helper functions used in stat calculations', () => {
  describe('maxHealth', () => {
    it('provides a maximum Health value', () => {
      const HEALTH_CAP = 50;

      expect(maxHealth).to.eql(HEALTH_CAP);
    });
  });

  const LEVEL_CAP = 100;
  const LEVEL = 57;

  describe('maxLevel', () => {
    it('returns a maximum level for attribute gain', () => {
      expect(maxLevel).to.eql(LEVEL_CAP);
    });
  });

  describe('capByLevel', () => {
    it('returns level given if below cap', () => {
      expect(capByLevel(LEVEL)).to.eql(LEVEL);
    });

    it('returns level given if equal to cap', () => {
      expect(capByLevel(LEVEL_CAP)).to.eql(LEVEL_CAP);
    });

    it('returns level cap if above cap', () => {
      expect(capByLevel(LEVEL_CAP + LEVEL)).to.eql(LEVEL_CAP);
    });
  });

  describe('toNextLevel', () => {
    it('increases Experience target from one level to the next', () => {
      _.times(110, (level) => {
        expect(tnl(level + 1)).to.be.greaterThan(tnl(level));
      });
    });
  });

  describe('diminishingReturns', () => {
    const BONUS = 600;
    const MAXIMUM = 200;
    const HALFWAY = 75;

    it('provides a value under the maximum, given a bonus and maximum', () => {
      expect(diminishingReturns(BONUS, MAXIMUM)).to.be.lessThan(MAXIMUM);
    });

    it('provides a value under the maximum, given a bonus, maximum, and halfway point', () => {
      expect(diminishingReturns(BONUS, MAXIMUM, HALFWAY)).to.be.lessThan(MAXIMUM);
    });

    it('provides a different curve if a halfway point is defined', () => {
      expect(diminishingReturns(BONUS, MAXIMUM, HALFWAY)).to.not.eql(diminishingReturns(BONUS, MAXIMUM));
    });
  });
});
