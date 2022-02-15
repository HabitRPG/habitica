/* eslint-disable global-require */
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import { ensurePermission } from '../../../../website/server/middlewares/ensureAccessRight';
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
    it('returns not authorized when user is not in userSupport', () => {
      res.locals = { user: { permissions: { userSupport: false } } };

      ensurePermission('userSupport')(req, res, next);

      const calledWith = next.getCall(0).args;
      expect(calledWith[0].message).to.equal(apiError('noPrivAccess'));
      expect(calledWith[0] instanceof NotAuthorized).to.equal(true);
    });

    it('passes when user is an userSuppor', () => {
      res.locals = { user: { permissions: { userSupport: true } } };

      ensurePermission('userSupport')(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });

  context('ensure newsPoster', () => {
    it('returns not authorized when user is not a newsPoster', () => {
      res.locals = { user: { permissions: { news: false } } };

      ensurePermission('news')(req, res, next);

      const calledWith = next.getCall(0).args;
      expect(calledWith[0].message).to.equal(apiError('noPrivAccess'));
      expect(calledWith[0] instanceof NotAuthorized).to.equal(true);
    });

    it('passes when user is a newsPoster', () => {
      res.locals = { user: { permissions: { news: true } } };

      ensurePermission('news')(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });

  context('ensure coupons', () => {
    it('returns not authorized when user does not have access to coupon calls', () => {
      res.locals = { user: { permissions: { coupons: false } } };

      ensurePermission('coupons')(req, res, next);

      const calledWith = next.getCall(0).args;
      expect(calledWith[0].message).to.equal(apiError('noPrivAccess'));
      expect(calledWith[0] instanceof NotAuthorized).to.equal(true);
    });

    it('passes when user has access to coupon calls', () => {
      res.locals = { user: { permissions: { coupons: true } } };

      ensurePermission('coupons')(req, res, next);

      expect(next).to.be.calledOnce;
      expect(next.args[0]).to.be.empty;
    });
  });
});
