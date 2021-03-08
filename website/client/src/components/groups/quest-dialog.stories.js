/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import { quests } from '@/../../common/script/content/quests';
import selectQuestModal from './selectQuestModal';
import questDetailModal from './questDetailModal';

const stories = storiesOf('Quests/Dialog', module);

stories.addDecorator(withKnobs);

stories
  .add('selectQuestDialog', () => ({
    components: { selectQuestModal },
    data () {
      return {
        quest: quests.goldenknight2,
        questWithDrop: quests.moon1,
      };
    },
    template: `  
      <div>
        <select-quest-modal :group="{}"></select-quest-modal>
      </div>
    `,
    mounted () {
      this.$root.$emit('bv::show::modal', 'select-quest-modal');
    },
  }))
  .add('questDetailModal', () => ({
    components: { questDetailModal },
    data () {
      return {
        quest: quests.goldenknight2,
        questWithDrop: quests.moon1,
      };
    },
    template: `  
      <div>
        <quest-detail-modal :group="{}"></quest-detail-modal>
      </div>
    `,
    mounted () {
      this.$root.$emit('bv::show::modal', 'quest-detail-modal');
    },
  }));
