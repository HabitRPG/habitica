import { model as User } from '../../../../../website/server/models/user';
import common from '../../../../../website/common';
import Bluebird from 'bluebird';

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
});
