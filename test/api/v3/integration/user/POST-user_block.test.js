import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('block user', () => {
  let user;
  let blockedUser;
  let blockedUser2;

  beforeEach(async () => {
    blockedUser = await generateUser();
    blockedUser2 = await generateUser();
    user = await generateUser({ inbox: { blocks: [blockedUser._id] } });
    expect(user.inbox.blocks.length).to.eql(1);
    expect(user.inbox.blocks).to.eql([blockedUser._id]);
  });

  it('validates uuid', async () => {
    await expect(user.post('/user/block/1')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidUUID'),
    });
  });

  it('successfully', async () => {
    let response = await user.post(`/user/block/${blockedUser2._id}`);
    await user.sync();
    expect(response).to.eql([blockedUser._id, blockedUser2._id]);
    expect(user.inbox.blocks.length).to.eql(2);
    expect(user.inbox.blocks).to.include(blockedUser2._id);
  });
});
