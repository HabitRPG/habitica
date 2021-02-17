import { shallowMount, createLocalVue } from '@vue/test-utils';

import Home from '@/components/static/home.vue';
import Store from '@/libs/store';
import * as Analytics from '@/libs/analytics';

const localVue = createLocalVue();
localVue.use(Store);

describe('Home', () => {
  let registerStub;
  let socialAuthStub;
  let store;
  let wrapper;

  function mountWrapper (query) {
    return shallowMount(Home, {
      store,
      localVue,
      mocks: {
        $t: string => string,
        $route: { query: query || {} },
      },
    });
  }

  async function fillOutUserForm (username, email, password) {
    await wrapper.find('#usernameInput').setValue(username);
    await wrapper.find('input[type=email]').setValue(email);
    await wrapper.findAll('input[type=password]').setValue(password);
  }

  beforeEach(() => {
    registerStub = sinon.stub();
    socialAuthStub = sinon.stub();
    store = new Store({
      state: {},
      getters: {},
      actions: {
        'auth:register': registerStub,
        'auth:socialAuth': socialAuthStub,
        'auth:verifyUsername': () => async () => ({}),
        'common:setTitle': () => {},
      },
    });

    sinon.stub(Analytics, 'track');

    wrapper = mountWrapper();
  });

  afterEach(sinon.restore);

  it('has a visible title', () => {
    expect(wrapper.find('h1').text()).to.equal('motivateYourself');
  });

  describe('signup form', () => {
    it('registers a user from the form', async () => {
      const username = 'newUser';
      const email = 'rookie@habitica.com';
      const password = 'ImmaG3tProductive!';
      await fillOutUserForm(username, email, password);

      await wrapper.find('form').trigger('submit');

      expect(registerStub.calledOnce).to.be.true;
      expect(registerStub.getCall(0).args[1]).to.deep.equal({
        username,
        email,
        password,
        passwordConfirm: password,
        groupInvite: '',
      });
    });

    it('registers a user with group invite if groupInvite in the query', async () => {
      const groupInvite = 'TheBestGroup';
      wrapper = mountWrapper({ groupInvite });
      await fillOutUserForm('invitedUser', 'invited@habitica.com', '1veGotFri3ndsHooray!');

      await wrapper.find('form').trigger('submit');

      expect(registerStub.calledOnce).to.be.true;
      expect(registerStub.getCall(0).args[1].groupInvite).to.equal(groupInvite);
    });

    it('registers a user with group invite if p in the query', async () => {
      const p = 'ThePiGroup';
      wrapper = mountWrapper({ p });
      await fillOutUserForm('alsoInvitedUser', 'invited2@habitica.com', '1veGotFri3nds2!');

      await wrapper.find('form').trigger('submit');

      expect(registerStub.calledOnce).to.be.true;
      expect(registerStub.getCall(0).args[1].groupInvite).to.equal(p);
    });

    it('registers a user with group invite invite if both p and groupInvite are in the query', async () => {
      const groupInvite = 'StillTheBestGroup';
      wrapper = mountWrapper({ p: 'LesserGroup', groupInvite });
      await fillOutUserForm('doublyInvitedUser', 'invited3@habitica.com', '1veGotSm4rtFri3nds!');

      await wrapper.find('form').trigger('submit');

      expect(registerStub.calledOnce).to.be.true;
      expect(registerStub.getCall(0).args[1].groupInvite).to.equal(groupInvite);
    });
  });
});
