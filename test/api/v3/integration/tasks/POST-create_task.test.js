import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

describe('POST /tasks', () => {
  let user;
  let api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('checks "req.body.type"', () => {
    it('returns an error if req.body.type is absent', () => {
      expect(api.post('/tasks', {
        notType: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('returns an error if req.body.type is not valid', () => {
      expect(api.post('/tasks', {
        type: 'habitF',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('checks "task.userId"', () => {
    it('sets "task.userId" to valid value', () => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
      });
    });
  });
});
