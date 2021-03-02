import {
  getLanguageFromBrowser,
  getLanguageFromUser,
} from '../../../../website/server/libs/language';
import {
  generateReq,
} from '../../../helpers/api-unit.helper';

describe('language lib', () => {
  let req;

  beforeEach(() => {
    req = generateReq();
  });

  describe('getLanguageFromUser', () => {
    it('uses the user preferred language if avalaible', () => {
      const user = {
        preferences: {
          language: 'it',
        },
      };

      expect(getLanguageFromUser(user, req)).to.equal('it');
    });

    it('falls back to english if the user preferred language is not avalaible', () => {
      const user = {
        preferences: {
          language: 'bla',
        },
      };

      expect(getLanguageFromUser(user, req)).to.equal('en');
    });
  });

  describe('getLanguageFromBrowser', () => {
    it('uses browser specificed language', () => {
      req.headers['accept-language'] = 'pt';

      expect(getLanguageFromBrowser(req)).to.equal('pt');
    });

    it('uses first language in series if browser specifies multiple', () => {
      req.headers['accept-language'] = 'he, pt, it';

      expect(getLanguageFromBrowser(req)).to.equal('he');
    });

    it('skips invalid lanaguages and uses first language in series if browser specifies multiple', () => {
      req.headers['accept-language'] = 'blah, he, pt, it';

      expect(getLanguageFromBrowser(req)).to.equal('he');
    });

    it('uses normal version of language if specialized locale is passed in', () => {
      req.headers['accept-language'] = 'fr-CA';

      expect(getLanguageFromBrowser(req)).to.equal('fr');
    });

    it('uses normal version of language if specialized locale is passed in', () => {
      req.headers['accept-language'] = 'fr-CA';

      expect(getLanguageFromBrowser(req)).to.equal('fr');
    });

    it('uses es if es is passed in', () => {
      req.headers['accept-language'] = 'es';

      expect(getLanguageFromBrowser(req)).to.equal('es');
    });

    it('uses es_419 if applicable es-languages are passed in', () => {
      req.headers['accept-language'] = 'es-mx';

      expect(getLanguageFromBrowser(req)).to.equal('es_419');
    });

    it('uses es_419 if multiple es languages are passed in', () => {
      req.headers['accept-language'] = 'es-GT, es-MX, es-CR';

      expect(getLanguageFromBrowser(req)).to.equal('es_419');
    });

    it('zh', () => {
      req.headers['accept-language'] = 'zh-TW';

      expect(getLanguageFromBrowser(req)).to.equal('zh_TW');
    });

    it('uses english if browser specified language is not compatible', () => {
      req.headers['accept-language'] = 'blah';

      expect(getLanguageFromBrowser(req)).to.equal('en');
    });

    it('uses english if browser does not specify', () => {
      req.headers['accept-language'] = '';

      expect(getLanguageFromBrowser(req)).to.equal('en');
    });

    it('uses english if browser does not supply an accept-language header', () => {
      delete req.headers['accept-language'];

      expect(getLanguageFromBrowser(req)).to.equal('en');
    });
  });
});
