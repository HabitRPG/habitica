import {
  generateRes,
  generateReq,
  generateNext,
} from '../../../../helpers/api-unit.helper';
import responseMiddleware from '../../../../../website/src/middlewares/api-v3/response'

describe('response middleware', function() {
  let res, req, next;

  beforeEach(() => {
    res = generateRes();
    req = generateReq();
    next = generateNext();
  });


  it('attaches respond method to res', function() {
    responseMiddleware(req, res, next);

    expect(res.respond).to.exist;
  });

  it('can be used to respond to requests', function() {
    responseMiddleware(req, res, next);
    res.respond(200, {field: 1});

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(200);
    expect(res.json).to.be.calledWith({
      field: 1,
      success: true,
    });
  });

  it('treats status >= 400 as failures', function() {
    responseMiddleware(req, res, next);
    res.respond(403, {field: 1});

    expect(res.status).to.be.calledOnce;
    expect(res.json).to.be.calledOnce;

    expect(res.status).to.be.calledWith(403);
    expect(res.json).to.be.calledWith({
      field: 1,
      success: false,
    });
  });
});
