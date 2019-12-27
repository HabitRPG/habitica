/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import i18n from '../../../../website/common/script/i18n';
import { ensureAdmin, ensureSudo } from '../../../../website/server/middlewares/ensureAccessRight';
import { NotAuthorized } from '../../../../website/server/libs/errors';
import apiError from '../../../../website/server/libs/apiError';

describe('ensure access middlewares', () => {
  let res; let req; let
    next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  context('ensure admin', () => {
    it('returns not authorized when user is not an admin', () => {
      res.locals = { user: { contributor: { admin: false } } };

      ensureAdmin(req, res, next);

      const calledWith = next.getCall(0).args;
      expect(calledWith[0].message).to.equal(i18n.t('noAdminAccess'));
      expect(calledWith[0] instanceof NotAuthorized).to.equal(true);
    });

    it('passes when user is an admin', () => {
      res.locals = { user: { contributor: { admin: true } } };

      ensureAdmin(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });

  context('ensure sudo', () => {
    it('returns not authorized when user is not a sudo user', () => {
      res.locals = { user: { contributor: { sudo: false } } };

      ensureSudo(req, res, next);

      const calledWith = next.getCall(0).args;
      expect(calledWith[0].message).to.equal(apiError('noSudoAccess'));
      expect(calledWith[0] instanceof NotAuthorized).to.equal(true);
    });

    it('passes when user is a sudo user', () => {
      res.locals = { user: { contributor: { sudo: true } } };

      ensureSudo(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });
});
