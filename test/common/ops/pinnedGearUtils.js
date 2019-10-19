import {
  generateUser,
} from '../../helpers/common.helper';
import { addPinnedGear } from '../../../website/common/script/ops/pinnedGearUtils';

describe('shared.ops.pinnedGearUtils.addPinnedGear', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('not adds an item with empty properties to pinnedItems', () => {
    addPinnedGear(user, undefined, undefined);

    expect(user.pinnedItems.length).to.be.eql(0);
  });
});
