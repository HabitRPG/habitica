import statsComputed from '../../../website/common/script/libs/statsComputed';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('common.fns.statsComputed', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns default values', () => {
    const result = statsComputed(user);
    expect(result.per).to.eql(0);
    expect(result.con).to.eql(0);
    expect(result.str).to.eql(0);
    expect(result.maxMP).to.eql(30);
  });

  it('calculates stat bonuses for equipment', () => {
    user.items.gear.equipped.weapon = 'weapon_rogue_1';
    const result = statsComputed(user);

    expect(result.str).to.eql(2);
    expect(result.gearBonus.str).to.eql(2);
  });

  it('calculates stat bonuses for class', () => {
    user.items.gear.equipped.weapon = 'weapon_warrior_1';
    const result = statsComputed(user);

    expect(result.str).to.eql(4.5);
    expect(result.gearBonus.str).to.eql(3);
    expect(result.classBonus.str).to.eql(1.5);
  });

  it('calculates stat bonuses for level', () => {
    user.stats.lvl = 25;
    const result = statsComputed(user);

    expect(result.str).to.eql(12);
    expect(result.levelBonus.str).to.eql(12);
  });

  it('correctly caps level stat bonuses', () => {
    user.stats.lvl = 150;
    const result = statsComputed(user);

    expect(result.str).to.eql(50);
    expect(result.levelBonus.str).to.eql(50);
  });

  it('sets baseStat field', () => {
    user.stats.str = 20;
    const result = statsComputed(user);

    expect(result.str).to.eql(20);
    expect(result.baseStat.str).to.eql(20);
  });

  it('sets buffs field', () => {
    user.stats.buffs.str = 150;
    const result = statsComputed(user);

    expect(result.str).to.eql(150);
    expect(result.buff.str).to.eql(150);
  });

  it('calculates mp from intelligence', () => {
    user.stats.int = 150;
    user.stats.buffs.int = 50;
    const result = statsComputed(user);

    expect(result.maxMP).to.eql(430);
  });

  it('calculates stat bonuses for back equipment', () => {
    user.items.gear.equipped.back = 'back_special_takeThis';
    const result = statsComputed(user);

    expect(result.int).to.eql(1);
    expect(result.per).to.eql(1);
    expect(result.con).to.eql(1);
    expect(result.str).to.eql(1);
  });
});
