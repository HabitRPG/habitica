import Vue from 'vue';
import storeInjector from 'inject-loader?-vue!client/store';
import { mapState, mapGetters, mapActions } from 'client/store';
import { flattenAndNamespace } from 'client/store/helpers/internals';

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
        ...flattenAndNamespace({
          nested: {
            computedName ({ state }) {
              return `${state.name} computed!`;
            },
          },
        }),
      },
      './actions': {
        getName ({ state }, ...args) {
          return [state.name, ...args];
        },
        ...flattenAndNamespace({
          nested: {
            getName ({ state }, ...args) {
              return [state.name, ...args];
            },
          },
        }),
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

  describe('getters', () => {
    it('supports getters', () => {
      expect(injectedStore.getters.computedName).to.equal('test computed!');
      injectedStore.state.name = 'test updated';
      expect(injectedStore.getters.computedName).to.equal('test updated computed!');
    });

    it('supports nested getters', () => {
      expect(injectedStore.getters['nested:computedName']).to.equal('test computed!');
      injectedStore.state.name = 'test updated';
      expect(injectedStore.getters['nested:computedName']).to.equal('test updated computed!');
    });
  });

  describe('actions', () => {
    it('can dispatch an action', () => {
      expect(injectedStore.dispatch('getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    it('can dispatch a nested action', () => {
      expect(injectedStore.dispatch('nested:getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    it('throws an error is the action doesn\'t exists', () => {
      expect(() => injectedStore.dispatched('wrong')).to.throw;
    });
  });

  describe('helpers', () => {
    it('mapState', (done) => {
      new Vue({ // eslint-disable-line no-new
        data: {
          title: 'internal',
        },
        computed: {
          ...mapState(['name']),
          ...mapState({
            nameComputed (state, getters) {
              return `${this.title} ${getters.computedName} ${state.name}`;
            },
          }),
        },
        created () {
          expect(this.name).to.equal('test');
          expect(this.nameComputed).to.equal('internal test computed! test');
          done();
        },
      });
    });

    it('mapGetters', (done) => {
      new Vue({ // eslint-disable-line no-new
        data: {
          title: 'internal',
        },
        computed: {
          ...mapGetters(['computedName']),
          ...mapGetters({
            nameComputedTwice: 'computedName',
          }),
        },
        created () {
          expect(this.computedName).to.equal('test computed!');
          expect(this.nameComputedTwice).to.equal('test computed!');
          done();
        },
      });
    });

    it('mapActions', (done) => {
      new Vue({ // eslint-disable-line no-new
        data: {
          title: 'internal',
        },
        methods: {
          ...mapActions(['getName']),
          ...mapActions({
            getNameRenamed: 'getName',
          }),
        },
        created () {
          expect(this.getName('123')).to.deep.equal(['test', '123']);
          expect(this.getNameRenamed('123')).to.deep.equal(['test', '123']);
          done();
        },
      });
    });

    it('flattenAndNamespace', () => {
      let result = flattenAndNamespace({
        nested: {
          computed ({ state }, ...args) {
            return [state.name, ...args];
          },
          getName ({ state }, ...args) {
            return [state.name, ...args];
          },
        },
        nested2: {
          getName ({ state }, ...args) {
            return [state.name, ...args];
          },
        },
      });

      expect(Object.keys(result).length).to.equal(3);
      expect(Object.keys(result).sort()).to.deep.equal(['nested2:getName', 'nested:computed', 'nested:getName']);
    });
  });
});
