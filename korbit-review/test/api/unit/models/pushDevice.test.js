import { model as PushDevice } from '../../../../website/server/models/pushDevice';

describe('PushDevice Model', () => {
  context('cleanupCorruptData', () => {
    it('converts an array of push devices to a safe version', () => {
      const pushDevices = [
        null, // invalid, not an object
        { regId: '123' }, // invalid, no type
        { type: 'android' }, // invalid, no regId
        new PushDevice({ type: 'android', regId: '1234' }), // valid
      ];

      const safePushDevices = PushDevice.cleanupCorruptData(pushDevices);
      expect(safePushDevices.length).to.equal(1);
      expect(safePushDevices[0].type).to.equal('android');
      expect(safePushDevices[0].regId).to.equal('1234');
    });

    it('removes duplicates', () => {
      const pushDevices = [
        new PushDevice({ type: 'android', regId: '1234' }),
        new PushDevice({ type: 'android', regId: '1234' }),
        new PushDevice({ type: 'iphone', regId: '1234' }), // not duplicate
        new PushDevice({ type: 'android', regId: '12345' }), // not duplicate
      ];

      const safePushDevices = PushDevice.cleanupCorruptData(pushDevices);
      expect(safePushDevices.length).to.equal(3);
      expect(safePushDevices[0].type).to.equal('android');
      expect(safePushDevices[0].regId).to.equal('1234');
    });
  });
});
