import Bluebird from 'bluebird';
import moment from 'moment';
import { model as User } from '../../../../../website/server/models/user';
import common from '../../../../../website/common';

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

    user.addComputedStatsToJSONObj(userToJSON.stats);

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
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({});
    });

    it('can add notifications with data', () => {
      let user = new User();

      user.addNotification('CRON', {field: 1});

      let userToJSON = user.toJSON();
      expect(user.notifications.length).to.equal(1);
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({field: 1});
    });

    context('static push method', () => {
      it('adds notifications for a single member via static method', async() => {
        let user = new User();
        await user.save();

        await User.pushNotification({_id: user._id}, 'CRON');

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});
      });

      it('validates notifications via static method', async() => {
        let user = new User();
        await user.save();

        expect(User.pushNotification({_id: user._id}, 'BAD_TYPE')).to.eventually.be.rejected;
      });

      it('adds notifications without data for all given users via static method', async() => {
        let user = new User();
        let otherUser = new User();
        await Bluebird.all([user.save(), otherUser.save()]);

        await User.pushNotification({_id: {$in: [user._id, otherUser._id]}}, 'CRON');

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});

        user = await User.findOne({_id: otherUser._id}).exec();

        userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({});
      });

      it('adds notifications with data for all given users via static method', async() => {
        let user = new User();
        let otherUser = new User();
        await Bluebird.all([user.save(), otherUser.save()]);

        await User.pushNotification({_id: {$in: [user._id, otherUser._id]}}, 'CRON', {field: 1});

        user = await User.findOne({_id: user._id}).exec();

        let userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({field: 1});

        user = await User.findOne({_id: otherUser._id}).exec();

        userToJSON = user.toJSON();
        expect(user.notifications.length).to.equal(1);
        expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type']);
        expect(userToJSON.notifications[0].type).to.equal('CRON');
        expect(userToJSON.notifications[0].data).to.eql({field: 1});
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

  context('hasNotCancelled', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });


    it('returns false if user does not have customer id', () => {
      expect(user.hasNotCancelled()).to.be.undefined;
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
  });
});
