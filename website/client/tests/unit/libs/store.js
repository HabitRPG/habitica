import Vue from 'vue';
import StoreModule, { mapState, mapGetters, mapActions } from 'client/libs/store';
import { flattenAndNamespace } from 'client/libs/store/helpers/internals';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = new StoreModule({ // eslint-disable-line babel/new-cap
      state: {
        name: 'test',
        nested: {
          name: 'nested state test',
        },
      },
      getters: {
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
      actions: {
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
    });

    Vue.use(StoreModule);
  });

  it('injects itself in all component', (done) => {
    new Vue({ // eslint-disable-line no-new
      store,
      created () {
        expect(this.$store).to.equal(store);
        done();
      },
    });
  });

  it('can watch a function on the state', (done) => {
    store.watch(state => state.name, (newName) => {
      expect(newName).to.equal('test updated');
      done();
    });

    store.state.name = 'test updated';
  });

  describe('getters', () => {
    it('supports getters', () => {
      expect(store.getters.computedName).to.equal('test computed!');
      store.state.name = 'test updated';
      expect(store.getters.computedName).to.equal('test updated computed!');
    });

    it('supports nested getters', () => {
      expect(store.getters['nested:computedName']).to.equal('test computed!');
      store.state.name = 'test updated';
      expect(store.getters['nested:computedName']).to.equal('test updated computed!');
    });
  });

  describe('actions', () => {
    it('can dispatch an action', () => {
      expect(store.dispatch('getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    it('can dispatch a nested action', () => {
      expect(store.dispatch('nested:getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    it('throws an error is the action doesn\'t exists', () => {
      expect(() => store.dispatched('wrong')).to.throw;
    });
  });

  describe('helpers', () => {
    it('mapState', (done) => {
      new Vue({ // eslint-disable-line no-new
        store,
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
          ...mapState({nestedTest: 'nested.name'}),
        },
        created () {
          expect(this.name).to.equal('test');
          expect(this.nameComputed).to.equal('internal test computed! test');
          expect(this.nestedTest).to.equal('nested state test');
          done();
        },
      });
    });

    it('mapGetters', (done) => {
      new Vue({ // eslint-disable-line no-new
        store,
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
        store,
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
