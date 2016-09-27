import Vue from 'vue';
import storeInjector from 'inject?-vue!client/store';

describe('Store', () => {
  let injectedStore;

  beforeEach(() => {
    injectedStore = storeInjector({ // eslint-disable-line babel/new-cap
      './state': {
        name: 'test',
      },
      './getters': {
        computedName ({ state }) {
          return `${state.name} computed!`;
        },
      },
      './actions': {
        getName ({ state }, ...args) {
          return [state.name, ...args];
        },
      },
    }).default;
  });

  it('injects itself in all component', (done) => {
    new Vue({ // eslint-disable-line no-new
      created () {
        expect(this.$store).to.equal(injectedStore);
        done();
      },
    });
  });

  it('can watch a function on the state', (done) => {
    injectedStore.watch(state => state.name, (newName) => {
      expect(newName).to.equal('test updated');
      done();
    });

    injectedStore.state.name = 'test updated';
  });

  it('supports getters', () => {
    expect(injectedStore.getters.computedName).to.equal('test computed!');
    injectedStore.state.name = 'test updated';
    expect(injectedStore.getters.computedName).to.equal('test updated computed!');
  });

  describe('actions', () => {
    it('can be dispatched', () => {
      expect(injectedStore.dispatch('getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    it('throws an error is the action doesn\'t exists', () => {
      expect(() => injectedStore.dispatched('wrong')).to.throw;
    });
  });
});
