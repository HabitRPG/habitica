let store = {};

let currentCount = 1;
let currentSpell = {
  key: '',
};
let timer = null;

// @TODO: We are using this lib in actions, so we have to inject store
function setStore (storeInc) {
  store = storeInc;
}

function castSpell () {
  clearTimeout(timer);

  currentSpell.quantity = currentCount;
  store.dispatch('user:castSpell', currentSpell);

  currentCount = 0;
}

function queue (spell, storeInc) {
  setStore(storeInc);

  currentCount += 1;

  if (currentSpell.key && spell.key !== currentSpell.key) {
    castSpell();
  }

  currentSpell = spell;

  clearTimeout(timer);
  timer = setTimeout(() => {
    castSpell();
  }, 1500);
}

export default { queue };
