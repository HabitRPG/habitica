import Vue from 'vue';
import merge from 'lodash/merge';

import Avatar from '@/components/avatar';
import generateStore from '@/store';

context('avatar.vue', () => {
  let Constructr;
  let vm;

  const baseMember = {
    stats: {
      buffs: {},
      class: 'warrior',
    },
    preferences: {
      hair: {},
    },
    items: {
      gear: {
        equipped: {},
      },
    },
  };

  beforeEach(() => {
    Constructr = Vue.extend(Avatar);

    vm = new Constructr({
      propsData: { member: baseMember },
    });

    vm.$store = generateStore();
  });

  afterEach(() => {
    vm.$destroy();
  });

  describe('hasClass', () => {
    beforeEach(() => {
      vm.member = merge({
        stats: { lvl: 17 },
        preferences: { disableClasses: true },
        flags: { classSelected: false },
      }, baseMember);
    });

    it('accurately reports class status', () => {
      expect(vm.hasClass).to.equal(false);

      vm.member.preferences.disableClasses = false;
      vm.member.flags.classSelected = true;

      expect(vm.hasClass).to.equal(true);
    });
  });

  describe('isBuffed', () => {
    it('accurately reports if buffed', () => {
      expect(vm.isBuffed).to.equal(undefined);

      vm.member.stats.buffs = { str: 1 };

      expect(vm.isBuffed).to.equal(1);
    });
  });

  describe('paddingTop', () => {
    xit('defaults to 27px', () => {
      vm.avatarOnly = true;
      expect(vm.paddingTop).to.equal('27px');
    });

    it('is 24px if user has a pet', () => {
      vm.member.items = merge({
        currentPet: { name: 'Foo' },
      }, baseMember.items);

      expect(vm.paddingTop).to.equal('24px');
    });

    it('is 0px if user has a mount', () => {
      vm.member.items = merge({
        currentMount: 'Bar',
      }, baseMember.items);

      expect(vm.paddingTop).to.equal('0px');
    });

    it('can be overriden', () => {
      vm.overrideTopPadding = '27px';
      expect(vm.paddingTop).to.equal('27px');
    });
  });

  describe('costumeClass', () => {
    it('returns if showing equipped gear', () => {
      expect(vm.costumeClass).to.equal('equipped');
    });

    it('returns if wearing a costume', () => {
      vm.member.preferences = { costume: true, hair: {} };
      vm.member.items.gear.costume = {};

      expect(vm.costumeClass).to.equal('costume');
    });
  });

  describe('visualBuffs', () => {
    it('returns an array of buffs', () => {
      vm.member = merge({
        stats: {
          class: 'warrior',
        },
      }, baseMember);

      expect(vm.visualBuffs).to.include({ snowball: 'avatar_snowball_warrior' });
      expect(vm.visualBuffs).to.include({ spookySparkles: 'ghost' });
      expect(vm.visualBuffs).to.include({ shinySeed: 'avatar_floral_warrior' });
      expect(vm.visualBuffs).to.include({ seafoam: 'seafoam_star' });
    });
  });

  describe('backgroundClass', () => {
    beforeEach(() => {
      vm.member.preferences = {
        hair: {},
        background: 'pony',
      };
    });

    it('shows the background', () => {
      expect(vm.backgroundClass).to.equal('background_pony');
    });

    it('can be overridden', () => {
      vm.overrideAvatarGear = { background: 'character' };

      expect(vm.backgroundClass).to.equal('background_character');
    });

    it('returns to a blank string if not showing background', () => {
      vm.withBackground = false;
      vm.avatarOnly = true;

      expect(vm.backgroundClass).to.equal('');
    });
  });

  describe('specialMountClass', () => {
    it('checks if riding a Kangaroo', () => {
      expect(vm.specialMountClass).to.equal(null);

      vm.member.items = {
        currentMount: 'Kangaroo',
        gear: { equipped: {} },
      };

      expect(vm.specialMountClass).to.equal('offset-kangaroo');
    });
  });

  describe('skinClass', () => {
    it('returns current skin color', () => {
      vm.member = merge({
        preferences: {
          skin: 'blue',
        },
      }, baseMember);

      expect(vm.skinClass).to.equal('skin_blue');
    });

    it('returns if sleep or not', () => {
      vm.member = merge({
        preferences: {
          skin: 'blue',
          sleep: false,
        },
      }, baseMember);

      expect(vm.skinClass).to.equal('skin_blue');

      vm.member.preferences.sleep = true;

      expect(vm.skinClass).to.equal('skin_blue_sleep');
    });
  });

  context('methods', () => {
    describe('getGearClass', () => {
      beforeEach(() => {
        vm.member = merge({
          items: {
            gear: {
              equipped: { Hat: 'Fancy Tophat' },
            },
          },
          preferences: { costume: false },
        }, baseMember);
      });

      it('returns undefined if no match', () => {
        expect(vm.getGearClass('foo')).to.equal(undefined);
      });

      it('returns the matching gear', () => {
        expect(vm.getGearClass('Hat')).to.equal('Fancy Tophat');
      });

      it('can be overridden', () => {
        vm.overrideAvatarGear = { Hat: 'Dapper Bowler' };

        expect(vm.getGearClass('Hat')).to.equal('Dapper Bowler');
      });
    });

    describe('hideGear', () => {
      it('returns no weapon equipped', () => {
        vm.member.items.gear.equipped = {};
        expect(vm.hideGear('weapon')).to.equal(false);
      });

      beforeEach(() => {
        vm.member = merge({
          items: {
            gear: {
              equipped: {
                weapon: {
                  baseWeapon: 'Spoon',
                  twoHanded: false,
                },
              },
            },
          },
          preferences: { costume: false },
        }, baseMember);
      });
    });

    describe('show avatar', () => {
      beforeEach(() => {
        vm.member = merge({
          stats: {
            buffs: {
              snowball: false,
              seafoam: false,
              spookySparkles: false,
              shinySeed: false,
            },
          },
        }, baseMember);
      });
      it('does if not showing visual buffs', () => {
        expect(vm.showAvatar()).to.equal(true);

        const { buffs } = vm.member.stats;

        buffs.snowball = true;
        expect(vm.showAvatar()).to.equal(false);

        buffs.snowball = false;
        buffs.spookySparkles = true;
        expect(vm.showAvatar()).to.equal(false);

        buffs.spookySparkles = false;
        buffs.shinySeed = true;
        expect(vm.showAvatar()).to.equal(false);

        buffs.shinySeed = false;
        buffs.seafoam = true;
        expect(vm.showAvatar()).to.equal(false);

        buffs.seafoam = false;
        vm.showVisualBuffs = false;
        expect(vm.showAvatar()).to.equal(true);
      });
    });
  });
});
