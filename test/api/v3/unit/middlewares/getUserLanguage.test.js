import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import getUserLanguage from '../../../../../website/src/middlewares/api-v3/getUserLanguage';
import { i18n } from '../../../../../common';
import Q from 'q';
import { model as User } from '../../../../../website/src/models/user';
import { translations } from '../../../../../website/src/libs/api-v3/i18n';
import accepts from 'accepts';

describe('getUserLanguage', () => {
  let res, req, next;

  let checkReqT = (req) => {
    expect(res.t).to.be.a('function');
    expect(res.t('help')).to.equal(i18n.t('help', req.language));
  };

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  context('query parameter', () => {
    it('uses the language in the query parameter if avalaible', () => {
      req.query = {
        lang: 'es',
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('es');
      checkReqT(req);
    });

    it('falls back to english if the query parameter language does not exists', () => {
      req.query = {
        lang: 'bla',
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('en');
      checkReqT(req);
    });

    it('uses query even if the request includes a user and session', () => {
      req.query = {
        lang: 'es',
      };

      req.locals = {
        user: {
          preferences: {
            language: 'it',
          },
        },
      };

      req.session = {
        userId: 123
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('es');
      checkReqT(req);
    });
  });

  context('authorized request', () => {
    it('uses the user preferred language if avalaible', () => {
      req.locals = {
        user: {
          preferences: {
            language: 'it',
          },
        },
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('it');
      checkReqT(req);
    });

    it('falls back to english if the user preferred language is not avalaible', (done) => {
      req.locals = {
        user: {
          preferences: {
            language: 'bla',
          },
        },
      };

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('en');
        checkReqT(req);
        done();
      });
    });

    it('uses the user preferred language even if a session is included in request', () => {
      req.locals = {
        user: {
          preferences: {
            language: 'it',
          },
        },
      };

      req.session = {
        userId: 123
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('it');
      checkReqT(req);
    });
  });

  context('request with session', () => {
    it('uses the user preferred language if avalaible', (done) => {
      sandbox.stub(User, 'findOne').returns({
        exec() {
          return Q.resolve({
            preferences: {
              language: 'it',
            }
          });
        }
      });

      req.session = {
        userId: 123
      };

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('it');
        checkReqT(req);
        done();
      });
    });
  });

  context('browser fallback', () => {
    it('uses browser specificed language', (done) => {
      req.headers['accept-language'] = 'pt';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('pt');
        checkReqT(req);
        done();
      });
    });

    it('uses first language in series if browser specifies multiple', (done) => {
      req.headers['accept-language'] = 'he, pt, it';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('he');
        checkReqT(req);
        done();
      });
    });

    it('skips invalid lanaguages and uses first language in series if browser specifies multiple', (done) => {
      req.headers['accept-language'] = 'blah, he, pt, it';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('he');
        checkReqT(req);
        done();
      });
    });

    it('uses normal version of language if specialized locale is passed in', (done) => {
      req.headers['accept-language'] = 'fr-CA';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('fr');
        checkReqT(req);
        done();
      });
    });

    it('uses normal version of language if specialized locale is passed in', (done) => {
      req.headers['accept-language'] = 'fr-CA';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('fr');
        checkReqT(req);
        done();
      });
    });

    it('uses es if es is passed in', (done) => {
      req.headers['accept-language'] = 'es';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('es');
        checkReqT(req);
        done();
      });
    });

    it('uses es_419 if applicable es-languages are passed in', (done) => {
      req.headers['accept-language'] = 'es-mx';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('es_419');
        checkReqT(req);
        done();
      });
    });

    it('uses es_419 if multiple es languages are passed in', (done) => {
      req.headers['accept-language'] = 'es-GT, es-MX, es-CR';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('es_419');
        checkReqT(req);
        done();
      });
    });

    it('zh', (done) => {
      req.headers['accept-language'] = 'zh-TW';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('zh_TW');
        checkReqT(req);
        done();
      });
    });

    it('uses english if browser specified language is not compatible', (done) => {
      req.headers['accept-language'] = 'blah';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('en');
        checkReqT(req);
        done();
      });
    });

    it('uses english if browser does not specify', (done) => {
      req.headers['accept-language'] = '';

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('en');
        checkReqT(req);
        done();
      });
    });

    it('uses english if browser does not supply an accept-language header', (done) => {
      delete req.headers['accept-language'];

      getUserLanguage(req, res, () => {
        expect(req.language).to.equal('en');
        checkReqT(req);
        done();
      });
    });
  });
});
