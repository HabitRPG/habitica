import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import {
  getUserLanguage,
  attachTranslateFunction,
} from '../../../../../website/server/middlewares/language';
import common from '../../../../../website/common';
import Bluebird from 'bluebird';
import { model as User } from '../../../../../website/server/models/user';

const i18n = common.i18n;

describe('language middleware', () => {
  describe('res.t', () => {
    let res, req, next;

    beforeEach(() => {
      res = generateRes();
      req = generateReq();
      next = generateNext();

      sinon.stub(i18n, 't');
    });

    afterEach(() => {
      i18n.t.restore();
    });

    it('attaches t method to res', () => {
      attachTranslateFunction(req, res, next);

      expect(res.t).to.exist;
    });

    it('uses the language specified in req.language', () => {
      req.language = 'de';

      attachTranslateFunction(req, res, next);
      res.t(1, 2);

      expect(i18n.t).to.be.calledOnce;
      expect(i18n.t).to.be.calledWith(1, 2);
    });
  });

  describe('getUserLanguage', () => {
    let res, req, next;

    let checkResT = (resToCheck) => {
      expect(resToCheck.t).to.be.a('function');
      expect(resToCheck.t('help')).to.equal(i18n.t('help', req.language));
    };

    beforeEach(() => {
      res = generateRes();
      req = generateReq();
      next = generateNext();
      attachTranslateFunction(req, res, next);
    });

    context('query parameter', () => {
      it('uses the language in the query parameter if avalaible', () => {
        req.query = {
          lang: 'es',
        };

        getUserLanguage(req, res, next);
        expect(req.language).to.equal('es');
        checkResT(res);
      });

      it('falls back to english if the query parameter language does not exists', () => {
        req.query = {
          lang: 'bla',
        };

        getUserLanguage(req, res, next);
        expect(req.language).to.equal('en');
        checkResT(res);
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
          userId: 123,
        };

        getUserLanguage(req, res, next);
        expect(req.language).to.equal('es');
        checkResT(res);
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
        checkResT(res);
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
          checkResT(res);
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
          userId: 123,
        };

        getUserLanguage(req, res, next);
        expect(req.language).to.equal('it');
        checkResT(res);
      });
    });

    context('request with session', () => {
      it('uses the user preferred language if avalaible', (done) => {
        sandbox.stub(User, 'findOne').returns({
          lean () {
            return this;
          },
          exec () {
            return Bluebird.resolve({
              preferences: {
                language: 'it',
              },
            });
          },
        });

        req.session = {
          userId: 123,
        };

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('it');
          checkResT(res);
          done();
        });
      });
    });

    context('browser fallback', () => {
      it('uses browser specificed language', (done) => {
        req.headers['accept-language'] = 'pt';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('pt');
          checkResT(res);
          done();
        });
      });

      it('uses first language in series if browser specifies multiple', (done) => {
        req.headers['accept-language'] = 'he, pt, it';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('he');
          checkResT(res);
          done();
        });
      });

      it('skips invalid lanaguages and uses first language in series if browser specifies multiple', (done) => {
        req.headers['accept-language'] = 'blah, he, pt, it';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('he');
          checkResT(res);
          done();
        });
      });

      it('uses normal version of language if specialized locale is passed in', (done) => {
        req.headers['accept-language'] = 'fr-CA';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('fr');
          checkResT(res);
          done();
        });
      });

      it('uses normal version of language if specialized locale is passed in', (done) => {
        req.headers['accept-language'] = 'fr-CA';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('fr');
          checkResT(res);
          done();
        });
      });

      it('uses es if es is passed in', (done) => {
        req.headers['accept-language'] = 'es';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('es');
          checkResT(res);
          done();
        });
      });

      it('uses es_419 if applicable es-languages are passed in', (done) => {
        req.headers['accept-language'] = 'es-mx';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('es_419');
          checkResT(res);
          done();
        });
      });

      it('uses es_419 if multiple es languages are passed in', (done) => {
        req.headers['accept-language'] = 'es-GT, es-MX, es-CR';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('es_419');
          checkResT(res);
          done();
        });
      });

      it('zh', (done) => {
        req.headers['accept-language'] = 'zh-TW';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('zh_TW');
          checkResT(res);
          done();
        });
      });

      it('uses english if browser specified language is not compatible', (done) => {
        req.headers['accept-language'] = 'blah';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('en');
          checkResT(res);
          done();
        });
      });

      it('uses english if browser does not specify', (done) => {
        req.headers['accept-language'] = '';

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('en');
          checkResT(res);
          done();
        });
      });

      it('uses english if browser does not supply an accept-language header', (done) => {
        delete req.headers['accept-language'];

        getUserLanguage(req, res, () => {
          expect(req.language).to.equal('en');
          checkResT(res);
          done();
        });
      });
    });
  });
});
