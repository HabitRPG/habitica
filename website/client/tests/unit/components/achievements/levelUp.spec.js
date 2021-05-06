import LevelUp from '@/components/achievements/levelUp.vue';

/*
// I couldn't get rendering to work for the modal, this is what I tried.
// Now the testing is done by overriding `this` for the exported computed
// functions directly.  I intend to come back to this later to test it
// properly in a rendered component.

import { mount, createLocalVue } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Store from '@/libs/store';

const localVue = createLocalVue();
localVue.use(Store);
localVue.use(BootstrapVue);

function createContainer () {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}
*/

describe('LevelUp', () => {
  function testFunction (name, level = 10) {
    return LevelUp.computed[name].bind({
      user: { stats: { lvl: level } },
      $t: (...args) => args.map(JSON.stringify).join(' '),
    });
  }

  /*
  // More potential rendering code
  let wrapper;
  beforeEach(async () => {
    wrapper = mount(LevelUp, {
      store: new Store({
        state: { user: { data: createUser() } },
        getters: {},
        actions: {},
      }),
      propsData: {
        static: true,
        visible: true,
      },
      localVue,
      mocks: { $t: string => string },
      attachTo: createContainer(),
    });
  });
  */

  it('displays the right level in the title', () => {
    const title = testFunction('title', 12);

    expect(title()).to.equal('"reachedLevel" {"level":12}');
  });

  it('does not display rewards for level 10', () => {
    const displayRewardQuest = testFunction('displayRewardQuest', 10);

    expect(displayRewardQuest()).to.be.false;
  });

  [15, 30, 40, 60].forEach(level => {
    it(`does display rewards for level ${level}`, () => {
      const displayRewardQuest = testFunction('displayRewardQuest', level);

      expect(displayRewardQuest()).to.be.true;
    });
  });

  it('generates the right test class for level 15', () => {
    const questClass = testFunction('questClass', 15);

    expect(questClass()).to.equal('scroll inventory_quest_scroll_atom1');
  });
});
