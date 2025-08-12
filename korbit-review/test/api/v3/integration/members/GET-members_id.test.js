import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import common from '../../../../../website/common';

describe('GET /members/:memberId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId', async () => {
    await expect(user.get('/members/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns a member public data only', async () => {
    // make sure user has all the fields that can be returned by the getMember call
    const member = await generateUser({
      contributor: { level: 1 },
      backer: { tier: 3 },
      preferences: {
        costume: false,
        background: 'volcano',
      },
      secret: {
        text: 'Clark Kent',
      },
    });
    const memberRes = await user.get(`/members/${member._id}`);
    expect(memberRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'id', 'preferences', 'profile', 'stats', 'achievements', 'party',
      'backer', 'contributor', 'auth', 'items', 'inbox', 'loginIncentives', 'flags',
    ]);
    expect(Object.keys(memberRes.auth)).to.eql(['local', 'timestamps']);
    expect(Object.keys(memberRes.preferences).sort()).to.eql([
      'size', 'hair', 'skin', 'shirt',
      'chair', 'costume', 'sleep', 'background', 'tasks', 'disableClasses',
    ].sort());

    expect(memberRes.stats.maxMP).to.exist;
    expect(memberRes.stats.maxHealth).to.equal(common.maxHealth);
    expect(memberRes.stats.toNextLevel).to.equal(common.tnl(memberRes.stats.lvl));
    expect(memberRes.inbox.optOut).to.exist;
    expect(memberRes.inbox.messages).to.not.exist;
    expect(memberRes.secret).to.not.exist;
  });

  it('does not return secret for the own account', async () => {
    // make sure user has all the fields that can be returned by the getMember call
    const member = await generateUser({
      contributor: { level: 1 },
      backer: { tier: 3 },
      preferences: {
        costume: false,
        background: 'volcano',
      },
      secret: {
        text: 'Clark Kent',
      },
    });
    const memberRes = await member.get(`/members/${member._id}`);
    expect(memberRes).to.have.keys([ // works as: object has all and only these keys
      '_id', 'id', 'preferences', 'profile', 'stats', 'achievements', 'party',
      'backer', 'contributor', 'auth', 'items', 'inbox', 'loginIncentives', 'flags',
    ]);

    expect(memberRes.secret).to.not.exist;
  });

  it('handles non-existing members', async () => {
    const dummyId = generateUUID();
    await expect(user.get(`/members/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', { userId: dummyId }),
    });
  });
});
