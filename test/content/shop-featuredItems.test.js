import Sinon from 'sinon';
import featuredItems from '../../website/common/script/content/shop-featuredItems';

describe('Shop Featured Items', () => {
  let clock;

  afterEach(() => {
    if (clock !== undefined) {
      clock.restore();
      clock = undefined;
    }
  });

  describe('Market', () => {
    it('contains armoire', () => {
      const items = featuredItems.market();
      expect(_.find(items, item => item.path === 'armoire')).to.exist;
    });

    it('contains the current premium hatching potions', () => {
      clock = Sinon.useFakeTimers(new Date('2024-04-08'));
      const items = featuredItems.market();
      expect(_.find(items, item => item.path === 'premiumHatchingPotions.Porcelain')).to.exist;
    });

    it('is featuring 4 items', () => {
      clock = Sinon.useFakeTimers(new Date('2024-02-08'));
      const items = featuredItems.market();
      expect(items.length).to.eql(4);
    });
  });

  describe('Quest Shop', () => {
    it('contains bundle', () => {
      clock = Sinon.useFakeTimers(new Date('2024-03-08'));
      const items = featuredItems.quests();
      expect(_.find(items, item => item.path === 'quests.pinkMarble')).to.exist;
    });

    it('contains pet quests', () => {
      clock = Sinon.useFakeTimers(new Date('2024-04-08'));
      const items = featuredItems.quests();
      expect(_.find(items, item => item.path === 'quests.frog')).to.exist;
    });

    it('is featuring 3 items', () => {
      clock = Sinon.useFakeTimers(new Date('2024-02-08'));
      const items = featuredItems.quests();
      expect(items.length).to.eql(3);
    });
  });
});
