import { getMatchesByWordArray } from '../../../../website/server/libs/stringUtils';
import bannedWords from '../../../../website/server/libs/bannedWords';

describe('stringUtils', () => {
  describe('getMatchesByWordArray', () => {
    it('check all banned words are matched', async () => {
      const message = bannedWords.join(',').replace(/\\/g, '');
      const matches = getMatchesByWordArray(message, bannedWords);
      expect(matches.length).to.equal(bannedWords.length);
    });
    it('doesn\'t flag names with accented characters', () => {
      const name = 'TESTPLACEHOLDERSWEARWORDHEREé';
      const matches = getMatchesByWordArray(name, bannedWords);
      expect(matches.length).to.equal(0);
    });
  });
});
