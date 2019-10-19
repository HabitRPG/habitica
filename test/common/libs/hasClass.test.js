import hasClass from '../../../website/common/script/libs/hasClass';
import { generateUser } from '../../helpers/common.helper';

describe('hasClass', () => {
  it('returns false for user with level below 10', () => {
    const userLvl9 = generateUser({
      'stats.lvl': 9,
      'flags.classSelected': true,
      'preferences.disableClasses': false,
    });

    const result = hasClass(userLvl9);

    expect(result).to.eql(false);
  });

  it('returns false for user with class not selected', () => {
    const userClassNotSelected = generateUser({
      'stats.lvl': 10,
      'flags.classSelected': false,
      'preferences.disableClasses': false,
    });

    const result = hasClass(userClassNotSelected);

    expect(result).to.eql(false);
  });

  it('returns false for user with classes disabled', () => {
    const userClassesDisabled = generateUser({
      'stats.lvl': 10,
      'flags.classSelected': true,
      'preferences.disableClasses': true,
    });

    const result = hasClass(userClassesDisabled);

    expect(result).to.eql(false);
  });

  it('returns true for user with class', () => {
    const userClassSelected = generateUser({
      'stats.lvl': 10,
      'flags.classSelected': true,
      'preferences.disableClasses': false,
    });

    const result = hasClass(userClassSelected);

    expect(result).to.eql(true);
  });
});
