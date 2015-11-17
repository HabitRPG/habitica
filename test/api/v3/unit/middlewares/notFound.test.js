import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';

import notFoundHandler from '../../../../../website/src/middlewares/api-v3/notFound';

import { NotFound } from '../../../../../website/src/libs/api-v3/errors';

describe('notFoundHandler', () => {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  xit('sends NotFound error if the resource isn\'t found', () => {
    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(404);
    expect(res.json).to.be.calledWith({
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
