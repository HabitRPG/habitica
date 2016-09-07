import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import responseMiddleware from '../../../../../website/server/middlewares/response';

describe('response middleware', () => {
  let res, req, next;

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
    res.respond(200, {field: 1});

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(200);
    expect(res.json).to.be.calledWith({
      success: true,
      data: {field: 1},
      notifications: [],
    });
  });

  it('can be passed a third parameter to be used as optional message', () => {
    responseMiddleware(req, res, next);
    res.respond(200, {field: 1}, 'hello');

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(200);
    expect(res.json).to.be.calledWith({
      success: true,
      data: {field: 1},
      message: 'hello',
      notifications: [],
    });
  });

  it('treats status >= 400 as failures', () => {
    responseMiddleware(req, res, next);
    res.respond(403, {field: 1});

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(403);
    expect(res.json).to.be.calledWith({
      success: false,
      data: {field: 1},
      notifications: [],
    });
  });

  it('returns userV if a user is authenticated req.query.userV is passed', () => {
    responseMiddleware(req, res, next);
    req.query.userV = 3;
    res.respond(200, {field: 1});

    expect(res.json).to.be.calledOnce;

    expect(res.json).to.be.calledWith({
      success: true,
      data: {field: 1},
      notifications: [],
      userV: 0,
    });
  });

  it('returns notifications if a user is authenticated', () => {
    res.locals.user.notifications.push({type: 'NEW_CONTRIBUTOR_LEVEL'});
    let notification = res.locals.user.notifications[0].toJSON();

    responseMiddleware(req, res, next);
    res.respond(200, {field: 1});

    expect(res.json).to.be.calledOnce;

    expect(res.json).to.be.calledWith({
      success: true,
      data: {field: 1},
      notifications: [
        {
          type: notification.type,
          id: notification.id,
          createdAt: notification.createdAt,
          data: {},
        },
      ],
    });
  });
});
