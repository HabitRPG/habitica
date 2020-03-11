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

    it('removes multiple NEW_CHAT_MESSAGE for the same group', () => {
      const notifications = [
        new UserNotification({
          type: 'NEW_CHAT_MESSAGE',
          id: 123,
          data: { group: { id: 12345 } },
        }),
        new UserNotification({
          type: 'NEW_CHAT_MESSAGE',
          id: 1234,
          data: { group: { id: 12345 } },
        }),
        new UserNotification({
          type: 'NEW_CHAT_MESSAGE',
          id: 123,
          data: { group: { id: 123456 } },
        }), // not duplicate, different group
        new UserNotification({
          type: 'NEW_CHAT_MESSAGE_DIFF',
          id: 123,
          data: { group: { id: 12345 } },
        }), // not duplicate, different type
      ];

      const safeNotifications = UserNotification.cleanupCorruptData(notifications);
      expect(safeNotifications.length).to.equal(3);
      expect(safeNotifications[0].data).to.deep.equal({ group: { id: 12345 } });
      expect(safeNotifications[0].seen).to.equal(false);
      expect(safeNotifications[0].type).to.equal('NEW_CHAT_MESSAGE');
      expect(safeNotifications[0].id).to.equal('123');
    });
  });
});
