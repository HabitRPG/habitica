import { model as UserNotification } from '../../../../website/server/models/userNotification';

describe('UserNotification Model', () => {
  context('convertNotificationsToSafeJson', () => {
    it('converts an array of notifications to a safe version', () => {
      const notifications = [
        null, // invalid, not an object
        {seen: true}, // invalid, no type or id
        {id: 123}, // invalid, no type
        {type: 'ABC'}, // invalid, no id
        new UserNotification({type: 'ABC', id: 123}), // valid
      ];

      const notificationsToJSON = UserNotification.convertNotificationsToSafeJson(notifications);
      expect(notificationsToJSON.length).to.equal(1);
      expect(notificationsToJSON[0]).to.have.all.keys(['data', 'id', 'type', 'seen']);
      expect(notificationsToJSON[0].type).to.equal('ABC');
      expect(notificationsToJSON[0].id).to.equal('123');
    });
  });
});
