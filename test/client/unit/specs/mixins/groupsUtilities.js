import groupsUtilities from 'client/mixins/groupsUtilities';
import { TAVERN_ID } from 'common/script/constants';
import generateStore from 'client/store';
import Vue from 'vue';

describe('Groups Utilities Mixin', () => {
  let instance, user;

  before(() => {
    instance = new Vue({
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
      expect(instance.isMemberOfGroup).to.be.a.function;
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
});