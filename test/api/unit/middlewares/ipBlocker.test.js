import nconf from 'nconf';
import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import ipBlocker from '../../../../website/server/middlewares/ipBlocker';
import { NotAuthorized } from '../../../../website/server/libs/errors';

describe('ipBlocker middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('is disabled when the env var is not defined');
});
