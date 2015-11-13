import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import getUserLanguage from '../../../../../website/src/middlewares/api-v3/getUserLanguage';
import Q from 'q';
import { model as User } from '../../../../../website/src/models/user';
import { translations } from '../../../../../website/src/libs/api-v3/i18n';
import accepts from 'accepts';

describe('getUserLanguage', () => {
  let res, req, next;

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
    });

    it('falls back to english if the query parameter language does not exists', () => {
      req.query = {
        lang: 'bla',
      };

      getUserLanguage(req, res, next);
      expect(req.language).to.equal('en');
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
        done();
      });
    });
  });
});
