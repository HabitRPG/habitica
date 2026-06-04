import {
  describe, expect, test, afterEach,
} from 'vitest';
import axios from 'axios';
import sinon from 'sinon';
import { messageChallengeParticipants } from '@/store/actions/challenges';

const sandbox = sinon.createSandbox();

describe('challenge actions', () => {
  afterEach(() => {
    sandbox.restore();
  });

  test('posts messageChallengeParticipants payload', async () => {
    const response = {
      totalParticipants: 2,
      attemptedRecipients: 1,
      sent: 1,
      skipped: 0,
      skippedByReason: {},
    };
    sandbox.stub(axios, 'post').returns(Promise.resolve({ data: { data: response } }));

    const result = await messageChallengeParticipants({}, {
      challengeId: 'challenge-id',
      message: 'hello',
    });

    sinon.assert.calledWith(axios.post, '/api/v4/challenges/challenge-id/message-participants', {
      message: 'hello',
    });
    expect(result).to.equal(response);
  });
});
