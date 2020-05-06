import { createLocalVue } from '@vue/test-utils';
import groupsUtilities from '@/mixins/groupsUtilities';
import { TAVERN_ID } from '@/../../common/script/constants';
import generateStore from '@/store';
import Store from '@/libs/store';

const LocalVue = createLocalVue();
LocalVue.use(Store);

describe('Groups Utilities Mixin', () => {
  let instance;
  let user;

  before(() => {
    instance = new LocalVue({
      store: generateStore(),
      mixins: [groupsUtilities],
    });

    user = {
      _id: '123',
      party: {
        _id: '456',
      },
      guilds: ['789'],
    };
  });

  describe('isMemberOfGroup', () => {
    it('registers as a method', () => {
      expect(instance.isMemberOfGroup).to.exist;
    });

    it('returns true when the group is the Tavern', () => {
      expect(instance.isMemberOfGroup(user, {
        _id: TAVERN_ID,
      })).to.equal(true);
    });

    it('returns true when the group is the user\'s party', () => {
      expect(instance.isMemberOfGroup(user, {
        type: 'party',
        _id: user.party._id,
      })).to.equal(true);
    });

    it('returns false when the group is not the user\'s party', () => {
      expect(instance.isMemberOfGroup(user, {
        type: 'party',
        _id: 'not my party',
      })).to.equal(false);
    });

    it('returns true when the group is not a guild of which the user is a member', () => {
      expect(instance.isMemberOfGroup(user, {
        type: 'guild',
        _id: user.guilds[0],
      })).to.equal(true);
    });

    it('returns false when the group is not a guild of which the user is a member', () => {
      expect(instance.isMemberOfGroup(user, {
        type: 'guild',
        _id: 'not my guild',
      })).to.equal(false);
    });
  });

  describe('filterGuild', () => {
    let testGroup;
    let testGroup2;

    before(() => {
      testGroup = {
        type: 'guild',
        _id: user.guilds[0],
        name: 'Crimson Vow',
        summary: 'testing',
        description: 'dummy 1',
        leader: user.guilds[0], // test user is not guild leader
        categories: [{
          _id: '123',
          slug: 'hobbies_occupations',
          name: 'hobbies_occupations',
        }],
        categorySlugs: ['hobbies_occupations'],
        memberCount: 1000,
      };
      testGroup2 = {
        type: 'guild',
        _id: '790',
        name: 'CAD Cads',
        summary: '3D',
        description: 'My dummy',
        leader: user._id, // test user is guild leader
        categories: [{
          _id: '123',
          slug: 'hobbies_occupations',
          name: 'hobbies_occupations',
        }],
        categorySlugs: ['hobbies_occupations'],
        memberCount: 100,
      };
    });

    it('returns true with no filter and no search', () => {
      const filter = {};
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns false with no filter and one search word not matching against any of the guild name, summary, and description', () => {
      const filter = {};
      const search = '3d';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(false);
    });

    it('returns true with no filter and one search word matched successfully against guild name', () => {
      const filter = {};
      const search = 'vow';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns true with no filter and one search word matched successfully against guild summary', () => {
      const filter = {};
      const search = 'test';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns true with no filter and one search word matched successfully against guild description', () => {
      const filter = {};
      const search = 'dum';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns true with no filter and two search words with two spaces in between matched successfully against guild name', () => {
      const filter = {};
      const search = 'cad  test';
      expect(instance.filterGuild(testGroup2, filter, search, user)).to.equal(true);
    });

    it('returns true with no filter and two search words with two spaces in between matched successfully against guild summary', () => {
      const filter = {};
      const search = 'cad  3d';
      expect(instance.filterGuild(testGroup2, filter, search, user)).to.equal(true);
    });

    it('returns true with no filter and two search words with two spaces in between matched successfully against guild description', () => {
      const filter = {};
      const search = 'my  dummy';
      expect(instance.filterGuild(testGroup2, filter, search, user)).to.equal(true);
    });

    it('returns false with no search word and one filter category that does not match against any guild categories', () => {
      const filter = {
        categories: ['academics'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(false);
    });

    it('returns true with no search word and one filter category that matches successfully against any guild categories', () => {
      const filter = {
        categories: ['hobbies_occupations'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns false with no search word and one filter role that does not match against guild role', () => {
      const filter = {
        roles: ['guild_leader'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(false);
    });

    it('returns true with no search word and one filter role that matches successfully against guild role', () => {
      const filter = {
        roles: ['member'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns true with no search word and filter size silver tier that matches against a guild size of 1000, the max guild size belonging to silver tier', () => {
      const filter = {
        guildSize: 'gold_tier',
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });

    it('returns true with no search word and filter size bronze tier that matches against a guild size of 100, the max guild size belonging to bronze tier', () => {
      const filter = {
        guildSize: 'silver_tier',
      };
      const search = '';
      expect(instance.filterGuild(testGroup2, filter, search, user)).to.equal(true);
    });

    it('returns false with no search word and filter category that matches successfully against one guild category and filter role that does not match against guild role', () => {
      const filter = {
        categories: ['hobbies_occupations'],
        roles: ['guild_leader'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(false);
    });

    it('returns true with no search word and filter category that matches successfully against one guild category and filter role that matches successfully against guild role', () => {
      const filter = {
        categories: ['hobbies_occupations'],
        roles: ['guild_leader'],
      };
      const search = '';
      expect(instance.filterGuild(testGroup2, filter, search, user)).to.equal(true);
    });

    it('returns false with one search word that does not match against guild name and one filter category that matches successfully against guild categories', () => {
      const filter = {
        categories: ['hobbies_occupations'],
      };
      const search = 'konnichiwa';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(false);
    });

    it('returns true with one search word that matches against guild name and one filter role that matches successfully against guild role', () => {
      const filter = {
        categories: ['hobbies_occupations'],
      };
      const search = 'vow';
      expect(instance.filterGuild(testGroup, filter, search, user)).to.equal(true);
    });
  });
});
