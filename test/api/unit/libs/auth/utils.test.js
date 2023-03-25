import {
  loginRes,
} from '../../../../../website/server/libs/auth/utils';
import {
  NotAuthorized,
} from '../../../../../website/common/script/libs/errors';

describe('Auth Utils', () => {
  let user; let req; let res;
  beforeEach(() => {
    user = {
      auth: {
        blocked: false,
        local: {
          username: 'username_example',
        },
      },
    };
    req = {
      url: 'https://www.test.com',
      headers: {
        'x-client': '',
      },
    };
    res = {
      respond () {},
      redirect () {},
      t () {},
    };
    res.redirect = sinon.spy();
    res.respond = sinon.spy();
  });
  describe('loginRes', () => {
    it('should throw error if user auth is blocked', () => {
      user.auth.blocked = true;

      try {
        loginRes(user, req, res);
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
      }
    });
    it('should redirect if header is android and url is apple', () => {
      user.auth.blocked = false;
      req.headers['x-client'] = 'habitica-android';
      req.url = 'https://www.test.com/example-apple';

      loginRes(user, req, res);

      expect(res.redirect).to.be.calledOnce;
    });

    it('should respond if header is android and url is not apple', () => {
      user.auth.blocked = false;
      req.headers['x-client'] = 'habitica-android';
      req.url = 'https://www.test.com';

      loginRes(user, req, res);

      expect(res.respond).to.be.calledOnce;
    });

    it('should respond if header is not android and url is apple', () => {
      user.auth.blocked = false;
      req.headers['x-client'] = 'NOT-habitica-android';
      req.url = 'https://www.test.com/example-apple';

      loginRes(user, req, res);

      expect(res.respond).to.be.calledOnce;
    });

    it('should respond if header is not android and url is not apple', () => {
      user.auth.blocked = false;
      req.headers['x-client'] = 'NOT-habitica-android';
      req.url = 'https://www.test.com';

      loginRes(user, req, res);

      expect(res.respond).to.be.calledOnce;
    });
  });
});
