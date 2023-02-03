// Arquivo: party.test.js
const party = require("./party");

describe("atualizar valores de saúde/exp/mana", () => {
  test("após o uso de uma habilidade de compartilhamento de MP", () => {
    const personagem = {
      health: 50,
      exp: 50,
      mana: 50
    };

    party.updateValuesAfterMPSharingAbility(personagem);

    expect(personagem.health).toBe(60);
    expect(personagem.exp).toBe(60);
    expect(personagem.mana).toBe(60);
  });

  test("após um período de tempo", () => {
    const personagem = {
      health: 50,
      exp: 50,
      mana: 50
    };

    party.updateValuesAfterTime(personagem);

    expect(personagem.health).toBe(55);
    expect(personagem.exp).toBe(55);
    expect(personagem.mana).toBe(55);
  });
});
