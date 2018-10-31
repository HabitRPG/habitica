import moment from 'moment';
import { model as User } from '../../../../website/server/models/user';
import { model as Group } from '../../../../website/server/models/group';
import common from '../../../../website/common';

describe('User Model', () => {
  it('keeps user._tmp when calling .toJSON', () => {
    let user = new User({
      auth: {
        local: {
          username: 'username',
          lowerCaseUsername: 'username',
          email: 'email@email.email',
          salt: 'salt',
          hashed_password: 'hashed_password', // eslint-disable-line camelcase
        },
      },
    });

    user._tmp = {ok: true};
    user._nonTmp = {ok: true};

    expect(user._tmp).to.eql({ok: true});
    expect(user._nonTmp).to.eql({ok: true});

    let toObject = user.toObject();
    let toJSON = user.toJSON();

    expect(toObject).to.not.have.keys('_tmp');
    expect(toObject).to.not.have.keys('_nonTmp');

    expect(toJSON).to.have.any.key('_tmp');
    expect(toJSON._tmp).to.eql({ok: true});
    expect(toJSON).to.not.have.keys('_nonTmp');
  });

  it('can add computed stats to a JSONified user object', () => {
    let user = new User();
    let userToJSON = user.toJSON();

    expect(userToJSON.stats.maxMP).to.not.exist;
    expect(userToJSON.stats.maxHealth).to.not.exist;
    expect(userToJSON.stats.toNextLevel).to.not.exist;

    User.addComputedStatsToJSONObj(userToJSON.stats, userToJSON);

    expect(userToJSON.stats.maxMP).to.exist;
    expect(userToJSON.stats.maxHealth).to.equal(common.maxHealth);
    expect(userToJSON.stats.toNextLevel).to.equal(common.tnl(user.stats.lvl));
  });

  it('can transform user object without mongoose helpers', async () => {
    let user = new User();
    await user.save();
    let userToJSON = await User.findById(user._id).lean().exec();

    expect(userToJSON.stats.maxMP).to.not.exist;
    expect(userToJSON.stats.maxHealth).to.not.exist;
    expect(userToJSON.stats.toNextLevel).to.not.exist;
    expect(userToJSON.id).to.not.exist;

    User.transformJSONUser(userToJSON);

    expect(userToJSON.id).to.equal(userToJSON._id);
    expect(userToJSON.stats.maxMP).to.not.exist;
    expect(userToJSON.stats.maxHealth).to.not.exist;
    expect(userToJSON.stats.toNextLevel).to.not.exist;
  });

  it('can transform user object without mongoose helpers (including computed stats)', async () => {
    let user = new User();
    await user.save();
    let userToJSON = await User.findById(user._id).lean().exec();

    expect(userToJSON.stats.maxMP).to.not.exist;
    expect(userToJSON.stats.maxHealth).to.not.exist;
    expect(userToJSON.stats.toNextLevel).to.not.exist;

    User.transformJSONUser(userToJSON, true);

    expect(userToJSON.id).to.equal(userToJSON._id);
    expect(userToJSON.stats.maxMP).to.exist;
    expect(userToJSON.stats.maxHealth).to.equal(common.maxHealth);
    expect(userToJSON.stats.toNextLevel).to.equal(common.tnl(user.stats.lvl));
  });

  context('notifications', () => {
    it('can add notifications without data', () => {
      let user = new User();

      user.addNotification('CRON');

      let userToJSON = user.toJSON();
      expect(user.notifications.length).to.equal(1);
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({});
      expect(userToJSON.notifications[0].seen).to.eql(false);
    });

    it('removes invalid notifications when calling toJSON', () => {
      let user = new User();

      user.notifications = [
        null, // invalid, not an object
        {seen: true}, // invalid, no type or id
        {id: 123}, // invalid, no type
        // {type: 'ABC'}, // invalid, no id, not included here because the id would be added automatically
        {type: 'ABC', id: '123'}, // valid
      ];

      const userToJSON = user.toJSON();
      expect(userToJSON.notifications.length).to.equal(1);

      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
      expect(userToJSON.notifications[0].type).to.equal('ABC');
      expect(userToJSON.notifications[0].id).to.equal('123');
    });

    it('can add notifications with data and already marked as seen', () => {
      let user = new User();

      user.addNotification('CRON', {field: 1}, true);

      let userToJSON = user.toJSON();
      expect(user.notifications.length).to.equal(1);
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({field: 1});
      expect(userToJSON.notifications[0].seen).to.eql(true);
    });

    context('static push method', () => {
      it('adds notifications for a single member via static method', async () => {
        let user = new User();
        await user.save();

        await User.pushNotification({_id: user._id}, 'CRON');

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});
      });

      it('validates notifications via static method', async () => {
        let user = new User();
        await user.save();

        expect(User.pushNotification({_id: user._id}, 'BAD_TYPE')).to.eventually.be.rejected;
        expect(User.pushNotification({_id: user._id}, 'CRON', null, 'INVALID_SEEN')).to.eventually.be.rejected;
      });

      it('adds notifications without data for all given users via static method', async () => {
        let user = new User();
        let otherUser = new User();
        await Promise.all([user.save(), otherUser.save()]);

        await User.pushNotification({_id: {$in: [user._id, otherUser._id]}}, 'CRON');

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});
        expect(userToJSON.notifications[0].seen).to.eql(false);

        user = await User.findOne({_id: otherUser._id}).exec();

        userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});
        expect(userToJSON.notifications[0].seen).to.eql(false);
      });

      it('adds notifications with data and seen status for all given users via static method', async () => {
        let user = new User();
        let otherUser = new User();
        await Promise.all([user.save(), otherUser.save()]);

        await User.pushNotification({_id: {$in: [user._id, otherUser._id]}}, 'CRON', {field: 1}, true);

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({field: 1});
        expect(userToJSON.notifications[0].seen).to.eql(true);

        user = await User.findOne({_id: otherUser._id}).exec();

        userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({field: 1});
        expect(userToJSON.notifications[0].seen).to.eql(true);
      });
    });
  });

  context('isSubscribed', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });


    it('returns false if user does not have customer id', () => {
      expect(user.isSubscribed()).to.be.undefined;
    });

    it('returns true if user does not have plan.dateTerminated', () => {
      user.purchased.plan.customerId = 'test-id';

      expect(user.isSubscribed()).to.be.true;
    });

    it('returns true if user if plan.dateTerminated is after today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().add(1, 'days').toDate();

      expect(user.isSubscribed()).to.be.true;
    });

    it('returns false if user if plan.dateTerminated is before today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();

      expect(user.isSubscribed()).to.be.false;
    });
  });

  context('canGetGems', () => {
    let user;
    let group;
    beforeEach(() => {
      user = new User();
      let leader = new User();
      group = new Group({
        name: 'test',
        type: 'guild',
        privacy: 'private',
        leader: leader._id,
      });
    });

    it('returns true if user is not subscribed', async () => {
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if user is not subscribed with a group plan', async () => {
      user.purchased.plan.customerId = 123;
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if user is subscribed with a group plan', async () => {
      user.purchased.plan.customerId = 'group-plan';
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if user is part of a group', async () => {
      user.guilds.push(group._id);
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if user is part of a group with a subscription', async () => {
      user.guilds.push(group._id);
      user.purchased.plan.customerId = 'group-plan';
      group.purchased.plan.customerId = 123;
      await group.save();
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if leader is part of a group with a subscription and canGetGems: false', async () => {
      user.guilds.push(group._id);
      user.purchased.plan.customerId = 'group-plan';
      group.purchased.plan.customerId = 123;
      group.leader = user._id;
      group.leaderOnly.getGems = true;
      await group.save();
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns true if user is part of a group with no subscription but canGetGems: false', async () => {
      user.guilds.push(group._id);
      user.purchased.plan.customerId = 'group-plan';
      group.leaderOnly.getGems = true;
      await group.save();
      expect(await user.canGetGems()).to.equal(true);
    });

    it('returns false if user is part of a group with a subscription and canGetGems: false', async () => {
      user.guilds.push(group._id);
      user.purchased.plan.customerId = 'group-plan';
      group.purchased.plan.customerId = 123;
      group.leaderOnly.getGems = true;
      await group.save();
      expect(await user.canGetGems()).to.equal(false);
    });
  });

  context('hasNotCancelled', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });

    it('returns false if user does not have customer id', () => {
      expect(user.hasNotCancelled()).to.be.false;
    });

    it('returns true if user does not have plan.dateTerminated', () => {
      user.purchased.plan.customerId = 'test-id';

      expect(user.hasNotCancelled()).to.be.true;
    });

    it('returns false if user if plan.dateTerminated is after today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().add(1, 'days').toDate();

      expect(user.hasNotCancelled()).to.be.false;
    });

    it('returns false if user if plan.dateTerminated is before today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();

      expect(user.hasNotCancelled()).to.be.false;
    });
  });


  context('hasCancelled', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });

    it('returns false if user does not have customer id', () => {
      expect(user.hasCancelled()).to.be.false;
    });

    it('returns false if user does not have plan.dateTerminated', () => {
      user.purchased.plan.customerId = 'test-id';

      expect(user.hasCancelled()).to.be.false;
    });

    it('returns true if user if plan.dateTerminated is after today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().add(1, 'days').toDate();

      expect(user.hasCancelled()).to.be.true;
    });

    it('returns false if user if plan.dateTerminated is before today', () => {
      user.purchased.plan.customerId = 'test-id';
      user.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();

      expect(user.hasCancelled()).to.be.false;
    });
  });

  context('pre-save hook', () => {
    it('does not try to award achievements when achievements or items not selected in query', async () => {
      let user = new User();
      user = await user.save(); // necessary for user.isSelected to work correctly

      // Create conditions for the Beast Master achievement to be awarded
      user.achievements.beastMasterCount = 3;
      expect(user.achievements.beastMaster).to.not.equal(true); // verify that it was not awarded initially

      user = await user.save();
      // verify that it's been awarded
      expect(user.achievements.beastMaster).to.equal(true);

      // reset the user
      user.achievements.beastMasterCount = 0;
      user.achievements.beastMaster = false;

      user = await user.save();
      // verify it's been removed
      expect(user.achievements.beastMaster).to.equal(false);

      // fetch the user without selecting the 'items' field
      user = await User.findById(user._id).select('-items').exec();
      expect(user.isSelected('items')).to.equal(false);

      // create the conditions for the beast master achievement but this time it should not be awarded
      user.achievements.beastMasterCount = 3;
      user = await user.save();
      expect(user.achievements.beastMaster).to.equal(false);

      // reset
      user.achievements.beastMasterCount = 0;
      user = await user.save();

      // this time with achievements not selected
      user = await User.findById(user._id).select('-achievements').exec();
      expect(user.isSelected('achievements')).to.equal(false);
      user.achievements.beastMasterCount = 3;
      user = await user.save();
      expect(user.achievements.beastMaster).to.not.equal(true);
    });

    context('manage unallocated stats points notifications', () => {
      it('doesn\'t add a notification if there are no points to allocate', async () => {
        let user = new User();

        user.flags.classSelected = true;
        user.preferences.disableClasses = false;
        user.stats.class = 'warrior';
        user = await user.save(); // necessary for user.isSelected to work correctly

        const oldNotificationsCount = user.notifications.length;

        user.stats.points = 0;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount);
      });

      it('removes a notification if there are no more points to allocate', async () => {
        let user = new User();

        user.flags.classSelected = true;
        user.preferences.disableClasses = false;
        user.stats.class = 'warrior';
        user.stats.points = 9;
        user = await user.save(); // necessary for user.isSelected to work correctly

        expect(user.notifications[0].type).to.equal('UNALLOCATED_STATS_POINTS');
        const oldNotificationsCount = user.notifications.length;

        user.stats.points = 0;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount - 1);
      });

      it('adds a notification if there are points to allocate', async () => {
        let user = new User();
        user.flags.classSelected = true;
        user.preferences.disableClasses = false;
        user.stats.class = 'warrior';
        user = await user.save(); // necessary for user.isSelected to work correctly
        const oldNotificationsCount = user.notifications.length;

        user.stats.points = 9;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount + 1);
        expect(user.notifications[0].type).to.equal('UNALLOCATED_STATS_POINTS');
        expect(user.notifications[0].data.points).to.equal(9);
      });

      it('adds a notification if the points to allocate have changed', async () => {
        let user = new User();
        user.stats.points = 9;
        user.flags.classSelected = true;
        user.preferences.disableClasses = false;
        user.stats.class = 'warrior';
        user = await user.save(); // necessary for user.isSelected to work correctly

        const oldNotificationsCount = user.notifications.length;
        const oldNotificationsUUID = user.notifications[0].id;
        expect(user.notifications[0].type).to.equal('UNALLOCATED_STATS_POINTS');
        expect(user.notifications[0].data.points).to.equal(9);

        user.stats.points = 11;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount);
        expect(user.notifications[0].type).to.equal('UNALLOCATED_STATS_POINTS');
        expect(user.notifications[0].data.points).to.equal(11);
        expect(user.notifications[0].id).to.not.equal(oldNotificationsUUID);
      });

      it('does not add a notification if the user has disabled classes', async () => {
        let user = new User();
        user.stats.points = 9;
        user.flags.classSelected = true;
        user.preferences.disableClasses = true;
        user.stats.class = 'warrior';
        user = await user.save(); // necessary for user.isSelected to work correctly

        const oldNotificationsCount = user.notifications.length;

        user.stats.points = 9;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount);
      });

      it('does not add a notification if the user has not selected a class', async () => {
        let user = new User();
        user.stats.points = 9;
        user.flags.classSelected = false;
        user.stats.class = 'warrior';
        user = await user.save(); // necessary for user.isSelected to work correctly

        const oldNotificationsCount = user.notifications.length;

        user.stats.points = 9;
        user = await user.save();

        expect(user.notifications.length).to.equal(oldNotificationsCount);
      });
    });
  });

  context('days missed', () => {
    // http://forbrains.co.uk/international_tools/earth_timezones
    let user;

    beforeEach(() => {
      user = new User();
    });

    it('should not cron early when going back a timezone', () => {
      const yesterday = moment('2017-12-05T00:00:00.000-06:00'); // 11 pm on 4 Texas
      const timezoneOffset = moment().zone('-06:00').zone();
      user.lastCron = yesterday;
      user.preferences.timezoneOffset = timezoneOffset;

      const today = moment('2017-12-06T00:00:00.000-06:00'); // 11 pm on 4 Texas
      const req = {};
      req.header = () => {
        return timezoneOffset + 60;
      };

      const {daysMissed} = user.daysUserHasMissed(today, req);

      expect(daysMissed).to.eql(0);
    });

    it('should not cron early when going back a timezone with a custom day start', () => {
      const yesterday = moment('2017-12-05T02:00:00.000-08:00');
      const timezoneOffset = moment().zone('-08:00').zone();
      user.lastCron = yesterday;
      user.preferences.timezoneOffset = timezoneOffset;
      user.preferences.dayStart = 2;

      const today = moment('2017-12-06T02:00:00.000-08:00');
      const req = {};
      req.header = () => {
        return timezoneOffset + 60;
      };

      const {daysMissed} = user.daysUserHasMissed(today, req);

      expect(daysMissed).to.eql(0);
    });
  });
});
