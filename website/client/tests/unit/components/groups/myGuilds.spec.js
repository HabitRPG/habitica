import { shallowMount, createLocalVue } from '@vue/test-utils';
import Store from '@/libs/store';
import myGuilds from '@/components/groups/myGuilds';
import PublicGuildItem from '@/components/groups/publicGuildItem';

const localVue = createLocalVue();
localVue.use(Store);

describe('myGuilds component', () => {
  let computed;
  const guilds = [{
    _id: '1',
    type: 'guild',
    name: 'Crimson Vow',
    summary: 'testing',
    description: 'testing',
  }, {
    _id: '2',
    type: 'guild',
    name: 'Log Horizon',
    summary: 'testing',
    description: 'testing',
  }, {
    _id: '3',
    type: 'guild',
    name: 'CAD Cads',
    summary: '3D',
    description: '3D',
  }, {
    _id: '4',
    type: 'guild',
    name: 'Santa Claus',
    summary: '3d',
    description: 'hohoho',
  }];
  const store = new Store({
    state: {
      user: {
        data: {
          _id: '999',
          guilds: ['1', '2', '3', '4'],
        },
      },
      editingGroup: {},
      constants: {
        TAVERN_ID: '9999',
      },
    },
    getters: {},
    actions: {
      'guilds:getMyGuilds': () => guilds,
      'common:setTitle': () => {},
    },
  });

  function makeWrapper (opts = {}) {
    return shallowMount(myGuilds, {
      data () {
        return {
          filter: {},
          search: '',
        };
      },
      store,
      localVue,
      ...opts,
    });
  }

  before(() => {
    computed = {
      guilds: () => guilds,
    };
  });

  it('renders all guilds with no filter and no search', () => {
    const wrapper = makeWrapper({ computed });
    expect(wrapper.findAll(PublicGuildItem).length).to.equal(4);
  });

  it('renders guilds with name matching against a single-word search term', () => {
    const search = 'vow';
    const wrapper = makeWrapper({ computed });
    wrapper.setData({ search });
    expect(wrapper.findAll(PublicGuildItem).length).to.equal(1);
  });

  it('renders guilds with summary matching against a single-word search term', () => {
    const search = '3d';
    const wrapper = makeWrapper({ computed });
    wrapper.setData({ search });
    expect(wrapper.findAll(PublicGuildItem).length).to.equal(2);
  });

  it('renders guilds with description matching against a single-word search term', () => {
    const search = 'hoho';
    const wrapper = makeWrapper({ computed });
    wrapper.setData({ search });
    expect(wrapper.findAll(PublicGuildItem).length).to.equal(1);
  });

  it('renders guilds with summary matching against two search terms with space in between', () => {
    const search = '3d    ohayou';
    const wrapper = makeWrapper({ computed });
    wrapper.setData({ search });
    expect(wrapper.findAll(PublicGuildItem).length).to.equal(2);
  });
});
