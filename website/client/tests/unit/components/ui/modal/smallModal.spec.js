import { mount, createLocalVue } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Store from '@/libs/store';

import smallModal from '@/components/ui/modal/smallModal';

const localVue = createLocalVue();
localVue.use(Store);
localVue.use(BootstrapVue);

describe('Small modal', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = mount(smallModal, {
      store: new Store({
        state: {},
        getters: {},
        actions: {},
      }),
      propsData: {
        id: 'test-small-modal',
        title: 'Test title',
      },
      localVue,
      mocks: { $t: (s, args) => s + JSON.stringify(args) },
    });
    wrapper.setData({ disableLazyRender: true });
  });

  it('Displays passed in title in Bootstrap modal with passed in ID', () => {
    expect(wrapper.find('#test-small-modal .modal-sm .modal-title').text()).to.equal('Test title');
  });
});
