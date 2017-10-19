import blockUser from '../../../website/common/script/ops/blockUser';
import {
  generateUser,
} from '../../helpers/common.helper';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.blockUser', () => {
  let user;
  let blockedUser;
  let blockedUser2;

  beforeEach(() => {
    blockedUser = generateUser();
    blockedUser2 = generateUser();
    user = generateUser();
    expect(user.inbox.blocks).to.eql([]);
  });

  it('validates uuid', (done) => {
    try {
      blockUser(user, { params: { uuid: '1' } });
    } catch (error) {
      expect(error.message).to.eql(i18n.t('invalidUUID'));
      done();
    }
  });

  it('validates user can\'t block himself', (done) => {
    try {
      blockUser(user, { params: { uuid: user._id } });
    } catch (error) {
      expect(error.message).to.eql(i18n.t('blockYourself'));
      done();
    }
  });

  it('blocks user', () => {
    let [result] = blockUser(user, { params: { uuid: blockedUser._id } });
    expect(user.inbox.blocks).to.eql([blockedUser._id]);
    expect(result).to.eql([blockedUser._id]);
    [result] = blockUser(user, { params: { uuid: blockedUser2._id } });
    expect(user.inbox.blocks).to.eql([blockedUser._id, blockedUser2._id]);
    expect(result).to.eql([blockedUser._id, blockedUser2._id]);
  });

  it('blocks, then unblocks user', () => {
    blockUser(user, { params: { uuid: blockedUser._id } });
    expect(user.inbox.blocks).to.eql([blockedUser._id]);
    let [result] = blockUser(user, { params: { uuid: blockedUser._id } });
    expect(user.inbox.blocks).to.eql([]);
    expect(result).to.eql([]);
  });
});
