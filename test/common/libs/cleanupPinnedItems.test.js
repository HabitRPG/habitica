import {
  generateUser,
} from '../../helpers/common.helper';
import cleanupPinnedItems from '../../../website/common/script/libs/cleanupPinnedItems';

describe('cleanupPinnedItems', () => {
  let user;
  let testPinnedItems;
  let clock;

  beforeEach(() => {
    user = generateUser();
    clock = sinon.useFakeTimers(new Date('2024-04-08'));

    testPinnedItems = [
      { type: 'armoire', path: 'armoire' },
      { type: 'potion', path: 'potion' },
      { type: 'background', path: 'backgrounds.backgrounds042020.heather_field' },
      { type: 'background', path: 'backgrounds.backgrounds042021.heather_field' },
      { type: 'premiumHatchingPotion', path: 'premiumHatchingPotions.Rainbow' },
      { type: 'premiumHatchingPotion', path: 'premiumHatchingPotions.StainedGlass' },
      { type: 'quests', path: 'quests.rat' },
      { type: 'quests', path: 'quests.spider' },
      { type: 'quests', path: 'quests.moon1' },
      { type: 'quests', path: 'quests.silver' },
      { type: 'marketGear', path: 'gear.flat.head_special_nye2021' },
      { type: 'gear', path: 'gear.flat.armor_special_spring2019Rogue' },
      { type: 'gear', path: 'gear.flat.armor_special_winter2021Rogue' },
      { type: 'mystery_set', path: 'mystery.201804' },
      { type: 'mystery_set', path: 'mystery.201506' },
      { type: 'bundles', path: 'bundles.farmFriends' },
      { type: 'bundles', path: 'bundles.birdBuddies' },
      { type: 'customization', path: 'skin.birdBuddies' },
    ];
  });

  afterEach(() => {
    clock.restore();
  });
  it('always keeps armoire and potion', () => {
    user.pinnedItems = testPinnedItems;

    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'armoire')).to.exist;
    expect(_.find(result, item => item.path === 'potion')).to.exist;
  });

  it('removes simple items that are no longer available', () => {
    user.pinnedItems = testPinnedItems;

    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'backgrounds.backgrounds042021.heather_field')).to.not.exist;
    expect(_.find(result, item => item.path === 'premiumHatchingPotions.Rainbow')).to.not.exist;
  });

  it('keeps simple items that are still available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'backgrounds.backgrounds042020.heather_field')).to.exist;
    expect(_.find(result, item => item.path === 'premiumHatchingPotions.StainedGlass')).to.exist;
  });

  it('removes gear that is no longer available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'gear.flat.armor_special_winter2021Rogue')).to.not.exist;
  });

  it('keeps gear that is still available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'gear.flat.armor_special_spring2019Rogue')).to.exist;
  });

  it('keeps gear that is not seasonal', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'gear.flat.head_special_nye2021')).to.exist;
  });

  it('removes time traveler gear that is no longer available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'mystery.201506')).to.not.exist;
  });

  it('keeps time traveler gear that is still available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'mystery.201804')).to.exist;
  });

  it('removes quests that are no longer available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'quests.rat')).to.not.exist;
    expect(_.find(result, item => item.path === 'quests.silver')).to.not.exist;
  });

  it('keeps quests that are still available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'quests.spider')).to.exist;
  });

  it('keeps quests that are not seasonal', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'quests.moon1')).to.exist;
  });

  it('removes bundles that are no longer available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'bundles.farmFriends')).to.not.exist;
  });

  it('keeps bundles that are still available', () => {
    user.pinnedItems = testPinnedItems;
    const result = cleanupPinnedItems(user);
    expect(_.find(result, item => item.path === 'bundles.birdBuddies')).to.exist;
  });
});
