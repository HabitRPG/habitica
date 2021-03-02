import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import {
  disableCache,
} from '../../../../website/server/middlewares/cache';

describe('cache middlewares', () => {
  let res; let req; let
    next;

  beforeEach(() => {
    req = generateReq();
    res = generateRes();
    next = generateNext();
  });

  describe('disableCache', () => {
    it('sets the correct headers', () => {
      disableCache(req, res, next);
      expect(res.set).to.have.been.calledWith('Cache-Control', 'no-store');
      expect(next).to.have.been.calledOnce;
    });

    xit('removes the etag header', () => {
      // @TODO how to stub onHeaders
    });
  });
});
