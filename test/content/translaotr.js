import {STRING_ERROR_MSG, STRING_DOES_NOT_EXIST_MSG} from '../helpers/content.helper';
import {translator} from '../../common/script/src/content/helpers';

describe('Translator', () => {
  it('returns error message if string is not properly formatted', () => {
    let improperlyFormattedString = translator('petName', {attr: 0})();
    expect(improperlyFormattedString).to.eql(STRING_ERROR_MSG);
  });

  it('returns an error message if string does not exist', () => {
    let stringDoesNotExist = translator('stringDoesNotExist')();
    expect(stringDoesNotExist).to.match(STRING_DOES_NOT_EXIST_MSG);
  });
});
