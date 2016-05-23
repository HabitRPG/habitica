let shared = require('../../common/script/index.js');

describe('user.ops', () => {
  let user;

  beforeEach(() => {
    user = {
      items: {
        gear: { },
        special: { },
      },
      achievements: { },
      flags: { },
    };

    shared.wrap(user);
  });

  describe('readCard', () => {
    it('removes card from invitation array', () => {
      user.items.special.valentineReceived = ['Leslie'];
      user.ops.readCard({ params: { cardType: 'valentine' } });

      expect(user.items.special.valentineReceived).to.be.empty;
    });

    it('removes the first card from invitation array', () => {
      user.items.special.valentineReceived = ['Leslie', 'Vicky'];
      user.ops.readCard({ params: { cardType: 'valentine' } });

      expect(user.items.special.valentineReceived).to.eql(['Vicky']);
    });
  });
});
