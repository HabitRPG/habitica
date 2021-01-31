import { mount, createLocalVue } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Store from '@/libs/store';

import LevelUp from '@/components/achievements/levelUp';
import smallModal from '@/components/ui/modal/smallModal';

const localVue = createLocalVue();
localVue.use(Store);
localVue.use(BootstrapVue);

describe('LevelUp', () => {
  function createWrapper (level = 10) {
    const wrapper = mount(LevelUp, {
      store: new Store({
        state: {
          user: {
            data: {
              stats: {
                lvl: level,
                buffs: {},
              },
              preferences: { hair: {} },
              items: { gear: { equipped: {} } },
            },
          },
        },
        getters: { 'members:hasClass': () => () => false },
        actions: {},
      }),
      localVue,
      mocks: { $t: (...args) => args.map(JSON.stringify).join(' ') },
    });
    wrapper.find(smallModal).setData({ disableLazyRender: true });
    return wrapper;
  }

  it('displays the right level in the title', () => {
    const wrapper = createWrapper(12);

    expect(wrapper.vm.title).to.equal('"reachedLevel" {"level":12}');
  });

  it('does not display rewards for level 10', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.displayRewardQuest).to.be.false;
  });

  [15, 30, 40, 60].forEach(level => {
    it(`does display rewards for level ${level}`, () => {
      const wrapper = createWrapper(level);

      expect(wrapper.vm.displayRewardQuest).to.be.true;
    });
  });

  it('generates the right test class for level 15', () => {
    const wrapper = createWrapper(15);

    expect(wrapper.vm.questClass).to.equal('scroll inventory_quest_scroll_atom1');
  });
});
