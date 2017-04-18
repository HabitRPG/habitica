import apiMessages from '../../../../../website/server/libs/apiMessages';

describe('API Messages', () => {
  const message = 'Only public guilds support pagination.';
  it('returns an API message', () => {
    expect(apiMessages('guildsOnlyPaginate')).to.equal(message);
  });

  it('throws if the API message does not exist', () => {
    expect(() => apiMessages('iDoNotExist')).to.throw;
  });

  it('clones the passed variables', () => {
    let vars = {a: 1};
    sandbox.stub(_, 'clone').returns({});
    apiMessages('guildsOnlyPaginate', vars);
    expect(_.clone).to.have.been.called.once;
    expect(_.clone).to.have.been.calledWith(vars);
  });

  it('pass the message through _.template', () => {
    let vars = {a: 1};
    let stub = sinon.stub().returns('string');
    sandbox.stub(_, 'template').returns(stub);
    apiMessages('guildsOnlyPaginate', vars);
    expect(_.template).to.have.been.called.once;
    expect(_.template).to.have.been.calledWith(message);
    expect(stub).to.have.been.called.once;
    expect(stub).to.have.been.calledWith(vars);
  });
});
