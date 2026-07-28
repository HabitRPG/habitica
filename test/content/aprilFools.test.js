import { getMatchingSwap, makeSubstitutionMap } from '../../website/common/script/content/constants/aprilFools';

describe('April Fools', () => {
  describe('getMatchingSwap', () => {
    it('returns Veggie for 2020', () => {
      const swap = getMatchingSwap(new Date('2020-04-01'));
      expect(swap).to.equal('Veggie');
    });
    it('returns Alien for 2026', () => {
      const swap = getMatchingSwap(new Date('2026-04-01'));
      expect(swap).to.equal('Alien');
    });
    it('Cycles through swaps correctly', () => {
      const swap = getMatchingSwap(new Date('2027-04-01'));
      expect(swap).to.equal('Veggie');
    });
  });

  describe('makeSubstitutionMap', () => {
    it('returns correct substitution for Veggie', () => {
      const substitutions = makeSubstitutionMap('Veggie');
      expect(substitutions.pets['Pet-Wolf-']).to.equal('Pet-Wolf-Veggie');
      expect(substitutions.pets['Pet-TigerCub-']).to.equal('Pet-TigerCub-Veggie');
      expect(substitutions.pets['Pet-Yarn-']).to.equal('Pet-BearCub-Veggie');
      expect(substitutions.pets.default).to.equal('Pet-Dragon-Veggie');
      expect(substitutions.pets.noPet).to.equal('Pet-Wolf-Veggie');
      expect(substitutions.pets.noPetIOS).to.equal('Pet-TigerCub-Veggie');
      expect(substitutions.pets.noPetAndroid).to.equal('Pet-Cactus-Veggie');
    });

    it('returns correct substitution for Cryptid', () => {
      const substitutions = makeSubstitutionMap('Cryptid');
      expect(substitutions.pets['Pet-Fox-']).to.equal('Pet-Fox-Cryptid');
      expect(substitutions.pets['Pet-FlyingPig-']).to.equal('Pet-FlyingPig-Cryptid');
      expect(substitutions.pets['Pet-Yarn-']).to.equal('Pet-BearCub-Cryptid');
      expect(substitutions.pets.default).to.equal('Pet-Dragon-Cryptid');
      expect(substitutions.pets.noPet).to.equal('Pet-Wolf-Cryptid');
      expect(substitutions.pets.noPetAndroid).to.equal('Pet-Cactus-Cryptid');
    });
  });
});
