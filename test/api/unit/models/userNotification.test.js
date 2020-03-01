import { model as UserNotification } from '../../../../website/server/models/userNotification';

describe('UserNotification Model', () => {
  context('cleanupCorruptData', () => {
    it('converts an array of notifications to a safe version', () => {
      const notifications = [
        null, // invalid, not an object
        { seen: true }, // invalid, no type or id
        { id: 123 }, // invalid, no type
        { type: 'ABC' }, // invalid, no id
        new UserNotification({ type: 'ABC', id: 123 }), // valid
      ];

      const safeNotifications = UserNotification.cleanupCorruptData(notifications);
      expect(safeNotifications.length).to.equal(1);
      expect(safeNotifications[0].data).to.deep.equal({});
      expect(safeNotifications[0].seen).to.equal(false);
      expect(safeNotifications[0].type).to.equal('ABC');
      expect(safeNotifications[0].id).to.equal('123');
    });
  });
});
