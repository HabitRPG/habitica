import getStore from '../store';

const store = getStore();

let currentCount = 1;
let currentSpell = {
  key: '',
};
let timer = null;

function castSpell () {
  clearTimeout(timer);

  currentSpell.quantity = currentCount;
  store.dispatch('user:castSpell', currentSpell);

  currentCount = 0;
}

function queue (spell) {
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
