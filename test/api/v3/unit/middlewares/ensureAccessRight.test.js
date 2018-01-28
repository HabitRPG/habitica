/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import i18n from '../../../../../website/common/script/i18n';
import { ensureAdmin, ensureSudo } from '../../../../../website/server/middlewares/ensureAccessRight';
import { NotAuthorized } from '../../../../../website/server/libs/errors';
import apiMessages from '../../../../../website/server/libs/apiMessages';

describe('ensure access middlewares', () => {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  context('ensure admin', () => {
    it('returns not authorized when user is not an admin', () => {
      res.locals = {user: {contributor: {admin: false}}};

      ensureAdmin(req, res, next);

      expect(next).to.be.calledWith(new NotAuthorized(i18n.t('noAdminAccess')));
    });

    it('passes when user is an admin', () => {
      res.locals = {user: {contributor: {admin: true}}};

      ensureAdmin(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });

  context('ensure sudo', () => {
    it('returns not authorized when user is not a sudo user', () => {
      res.locals = {user: {contributor: {sudo: false}}};

      ensureSudo(req, res, next);

      expect(next).to.be.calledWith(new NotAuthorized(apiMessages('noSudoAccess')));
    });

    it('passes when user is a sudo user', () => {
      res.locals = {user: {contributor: {sudo: true}}};

      ensureSudo(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });
});
