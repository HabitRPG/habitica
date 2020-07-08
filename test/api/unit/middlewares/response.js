import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../helpers/api-unit.helper';
import responseMiddleware from '../../../../website/server/middlewares/response';
import packageInfo from '../../../../package.json';

describe('response middleware', () => {
  let res; let req; let
    next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });

  it('attaches respond method to res', () => {
    responseMiddleware(req, res, next);

    expect(res.respond).to.exist;
  });

  it('can be used to respond to requests', () => {
    responseMiddleware(req, res, next);
    res.respond(200, { field: 1 });

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(200);
    expect(res.json).to.be.calledWith({
      success: true,
      data: { field: 1 },
      notifications: res.locals.user.notifications,
      userV: res.locals.user._v,
      appVersion: packageInfo.version,
    });
  });

  it('can be passed a third parameter to be used as optional message', () => {
    responseMiddleware(req, res, next);
    res.respond(200, { field: 1 }, 'hello');

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(200);
    expect(res.json).to.be.calledWith({
      success: true,
      data: { field: 1 },
      message: 'hello',
      notifications: res.locals.user.notifications,
      userV: res.locals.user._v,
      appVersion: packageInfo.version,
    });
  });

  it('treats status >= 400 as failures', () => {
    responseMiddleware(req, res, next);
    res.respond(403, { field: 1 });

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(403);
    expect(res.json).to.be.calledWith({
      success: false,
      data: { field: 1 },
      notifications: res.locals.user.notifications,
      userV: res.locals.user._v,
      appVersion: packageInfo.version,
    });
  });

  it('returns userV if a user is authenticated', () => {
    responseMiddleware(req, res, next);
    res.respond(200, { field: 1 });

    expect(res.json).to.be.calledOnce;

    expect(res.json).to.be.calledWith({
      success: true,
      data: { field: 1 },
      notifications: res.locals.user.notifications,
      userV: 0,
      appVersion: packageInfo.version,
    });
  });
});
