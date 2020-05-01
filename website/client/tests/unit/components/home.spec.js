import { shallowMount, createLocalVue } from '@vue/test-utils';
import sinon from 'sinon';

import Home from '@/components/static/home.vue';
import Store from '@/libs/store';
import * as Analytics from '@/libs/analytics';

const localVue = createLocalVue();
localVue.use(Store);

describe('Home', () => { // eslint-disable-line mocha/no-exclusive-tests
  let actionLog;
  let wrapper;

  beforeEach(() => {
    sinon.stub(Analytics, 'track');
    actionLog = {};

    const actions = {};
    ['auth:register', 'auth:socialAuth'].forEach(name => {
      actions[name] = (_, params) => {
        actionLog[name] = actionLog[name] || { count: 0, paramses: [] };
        actionLog[name].count += 1;
        actionLog[name].invocationParams.push(params);
      };
    });

    wrapper = shallowMount(Home, {
      store: new Store({
        state: {},
        getters: {},
        actions,
      }),
      localVue,
      mocks: {
        $t: string => string,
        ga: () => {},
      },
    });
  });

  afterEach(sinon.restore);

  it('Title is visible', () => {
    expect(wrapper.find('h1').text()).to.equal('motivateYourself');
  });
});
