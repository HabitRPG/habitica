import { model as User } from '../../../../../website/server/models/user';

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

  context('notifications', () => {
    it('can add notifications with data', () => {
      let user = new User();

      user.addNotification('CRON');

      let userToJSON = user.toJSON();
      expect(user.notifications.length).to.equal(1);
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'createdAt']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({});
    });

    it('can add notifications without data', () => {
      let user = new User();

      user.addNotification('CRON', {field: 1});

      let userToJSON = user.toJSON();
      expect(user.notifications.length).to.equal(1);
      expect(userToJSON.notifications[0]).to.have.all.keys(['data', 'id', 'type', 'createdAt']);
      expect(userToJSON.notifications[0].type).to.equal('CRON');
      expect(userToJSON.notifications[0].data).to.eql({field: 1});
    });
  });
});
