import Vue from 'vue';
import storeInjector from 'inject?./state!client/store';
import store from 'client/store';

describe('Store', () => {
  it('injects itself in all component', (done) => {
    new Vue({ // eslint-disable-line no-new
      created () {
        expect(this.$store).to.equal(store);
        done();
      },
    });
  });

  it('can watch a function on the state', (done) => {
    let injectedStore = storeInjector({ // eslint-disable-line babel/new-cap
      state: {
        name: 'test',
      },
    }).default;

    injectedStore.watch(state => state.name, (newName) => {
      expect(newName).to.equal('test updated');
      done();
    });

    injectedStore.state.name = 'test updated';
  });
  it('supports getters');

  describe('actions', () => {
    it('can be dispatched');
    it('throws an error is the action doesn\'t exists');
  });
});
