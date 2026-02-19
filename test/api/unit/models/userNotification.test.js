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

    it('removes duplicate STREAK_ACHIEVEMENT notifications', () => {
      // Fixes issue #13325 - Users receiving duplicate streak achievement notifications
      const notifications = [
        new UserNotification({
          type: 'STREAK_ACHIEVEMENT',
          id: 123,
          data: {},
        }),
        new UserNotification({
          type: 'STREAK_ACHIEVEMENT',
          id: 456,
          data: {},
        }),
        new UserNotification({
          type: 'CRON',
          id: 789,
          data: {},
        }), // different type, should be kept
      ];

      const safeNotifications = UserNotification.cleanupCorruptData(notifications);
      expect(safeNotifications.length).to.equal(2);
      expect(safeNotifications[0].type).to.equal('STREAK_ACHIEVEMENT');
      expect(safeNotifications[0].id).to.equal('123');
      expect(safeNotifications[1].type).to.equal('CRON');
      expect(safeNotifications[1].id).to.equal('789');
    });

    it('handles multiple STREAK_ACHIEVEMENT duplicates correctly', () => {
      // Test case: 3 duplicate STREAK_ACHIEVEMENT notifications
      const notifications = [
        new UserNotification({
          type: 'STREAK_ACHIEVEMENT',
          id: 111,
          data: {},
        }),
        new UserNotification({
          type: 'STREAK_ACHIEVEMENT',
          id: 222,
          data: {},
        }),
        new UserNotification({
          type: 'STREAK_ACHIEVEMENT',
          id: 333,
          data: {},
        }),
      ];

      const safeNotifications = UserNotification.cleanupCorruptData(notifications);
      expect(safeNotifications.length).to.equal(1);
      expect(safeNotifications[0].type).to.equal('STREAK_ACHIEVEMENT');
      expect(safeNotifications[0].id).to.equal('111'); // Keep first one
    });
  });
});
