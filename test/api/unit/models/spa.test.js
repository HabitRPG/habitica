import { model as User } from '../../../../website/server/models/user';

describe('recupera vida do personagem', () => {
  it('vida no máximo, não pode entrar no SPA', async () => {
    const user = new User();
    await user.save();
    const userToJSON = user.toJSON();
    User.transformJSONUser(userToJSON, true);

    const message = user.recuperaVida();
    expect(message).to.eventually.equal('Sua vida está no máximo!');
  });

  it('vida válida, pode entrar no SPA', async () => {
    const user = new User();
    await user.save();
    const userToJSON = user.toJSON();
    User.transformJSONUser(userToJSON, true);
    user.stats.hp = 10;

    const message = user.recuperaVida();
    expect(message).to.eventually.equal('Bem vindo ao SPA!');
  });

  it('aumenta mais um de vida no spa', async () => {
    const user = new User();
    await user.save();
    const userToJSON = user.toJSON();
    User.transformJSONUser(userToJSON, true);
    user.stats.hp = 10;

    user.recuperaVida();
    expect(user.stats.hp).to.be.equal(11);
  });
});
