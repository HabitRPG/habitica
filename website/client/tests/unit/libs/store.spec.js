import {
  describe, expect, test, beforeEach,
} from 'vitest';
import Vue from 'vue';
import StoreModule, { mapState, mapGetters, mapActions } from '@/libs/store';
import { flattenAndNamespace } from '@/libs/store/helpers/internals';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = new StoreModule({
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

  test('injects itself in all component', done => {
    new Vue({ // eslint-disable-line no-new
      store,
      created () {
        expect(this.$store).to.equal(store);
        done();
      },
    });
  });

  test('can watch a function on the state', done => {
    store.watch(state => state.name, newName => {
      expect(newName).to.equal('test updated');
      done();
    });

    store.state.name = 'test updated';
  });

  describe('getters', () => {
    test('supports getters', () => {
      expect(store.getters.computedName).to.equal('test computed!');
      store.state.name = 'test updated';
      expect(store.getters.computedName).to.equal('test updated computed!');
    });

    test('supports nested getters', () => {
      expect(store.getters['nested:computedName']).to.equal('test computed!');
      store.state.name = 'test updated';
      expect(store.getters['nested:computedName']).to.equal('test updated computed!');
    });
  });

  describe('actions', () => {
    test('can dispatch an action', async () => {
      expect(await store.dispatch('getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    test('can dispatch a nested action', async () => {
      expect(await store.dispatch('nested:getName', 1, 2, 3)).to.deep.equal(['test', 1, 2, 3]);
    });

    test('throws an error if the action doesn\'t exists', () => {
      expect(() => store.dispatched('wrong')).to.throw;
    });
  });

  describe('helpers', () => {
    test('mapState', done => {
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
          ...mapState({ nestedTest: 'nested.name' }),
        },
        created () {
          expect(this.name).to.equal('test');
          expect(this.nameComputed).to.equal('internal test computed! test');
          expect(this.nestedTest).to.equal('nested state test');
          done();
        },
      });
    });

    test('mapGetters', done => {
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

    test('mapActions', done => {
      new Vue({ // eslint-disable-line no-new
        store,
        data: {
          title: 'internal',
        },
        async created () {
          expect(await this.getName('123')).to.deep.equal(['test', '123']);
          expect(await this.getNameRenamed('123')).to.deep.equal(['test', '123']);
          done();
        },
        methods: {
          ...mapActions(['getName']),
          ...mapActions({
            getNameRenamed: 'getName',
          }),
        },
      });
    });

    test('flattenAndNamespace', () => {
      const result = flattenAndNamespace({
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
