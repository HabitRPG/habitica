// Arquivo: party.js
const updateValuesAfterMPSharingAbility = (personagem) => {
  personagem.health += 10;
  personagem.exp += 10;
  personagem.mana += 10;
};

const updateValuesAfterTime = (personagem) => {
  personagem.health += 5;
  personagem.exp += 5;
  personagem.mana += 5;
};

module.exports = {
  updateValuesAfterMPSharingAbility,
  updateValuesAfterTime
};
