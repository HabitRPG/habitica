import { STRING_DOES_NOT_EXIST_MSG } from '../helpers/content.helper';
import translator from '../../website/common/script/content/translation';

describe('Translator', () => {
  it('returns an error message if string does not exist', () => {
    const stringDoesNotExist = translator('stringDoesNotExist')();
    expect(stringDoesNotExist).to.match(STRING_DOES_NOT_EXIST_MSG);
  });
});
