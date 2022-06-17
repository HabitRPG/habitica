import { withKnobs } from '@storybook/addon-knobs';

import { quests } from '@/../../common/script/content/quests';
import content from '@/../../common/script/content';
import questDetailModal from './questDetailModal';
import questCompleted from '../achievements/questCompleted';

export default {
  title: 'Quests/Dialog',
  decorators: [withKnobs],
};

export const SelectQuestDialog = () => ({
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
});

SelectQuestDialog.story = {
  name: 'selectQuestDialog',
};

export const QuestDetailModal = () => ({
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
    this.$root.$emit('bv::show::modal', 'quest-detail-modal', {
      key: 'moon1',
      from: 'sidebar',
    });
  },
});

QuestDetailModal.story = {
  name: 'questDetailModal',
};

export const QuestCompleted = () => ({
  components: { questCompleted },
  data () {
    return {
      quest: quests.goldenknight2,
      questWithDrop: quests.moon1,
    };
  },
  template: `
      <div>
      <quest-completed></quest-completed>
      </div>
    `,
  mounted () {
    this.$root.$emit('bv::show::modal', 'quest-completed');
  },
  store: {
    state: {
      content,
      user: {
        data: {
          stats: {},
          tags: [],
          items: {
            quests: {
              moon1: 3,
            },
          },
          party: {
            quest: {
              completed: 'vice3',
            },
          },
        },
      },
    },
  },
});

QuestCompleted.story = {
  name: 'quest-completed',
};
