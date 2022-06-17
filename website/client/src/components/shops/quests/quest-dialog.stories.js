import { withKnobs } from '@storybook/addon-knobs';

import { quests } from '@/../../common/script/content/quests';
import questRewards from './questRewards';
import itemWithLabel from '../itemWithLabel';
import questPopover from './questPopover';

export default {
  title: 'Quests/Sub Components',
  decorators: [withKnobs],
};

export const QuestRewads = () => ({
  components: { questRewards },
  data () {
    return {
      quest: quests.goldenknight2,
      questWithDrop: quests.stressbeast,
      questWithGear: quests.moon1,
      evilsanta: quests.evilsanta,
    };
  },
  template: `  
      <div>
        <quest-rewards :quest="quest"></quest-rewards>
        <quest-rewards :quest="questWithDrop"></quest-rewards>
        <quest-rewards :quest="questWithGear"></quest-rewards>
        <quest-rewards :quest="evilsanta"></quest-rewards>
      </div>
    `,
});

QuestRewads.story = {
  name: 'questRewads',
};

export const ItemWithLabel = () => ({
  components: { itemWithLabel },
  data () {
    return {};
  },
  template: `      
      <div>
        <item-with-label :item="{}">
          <div slot="itemContent">
            
          </div>
          <div slot="itemImage">
            Image
          </div>
          <div slot="label">
            Label
          </div>
        </item-with-label>
        
        <item-with-label :item="{}" label-class="purple">
          <div slot="itemContent">
            
          </div>
          <div slot="itemImage">
            Image
          </div>
          <div slot="label">
            Label
          </div>
        </item-with-label>
      </div>
    `,
});

ItemWithLabel.story = {
  name: 'itemWithLabel',
};

export const QuestPopover = () => ({
  components: { questPopover },
  data () {
    return {
      quest: quests.goldenknight2,
      quest2: quests.moon1,
    };
  },
  template: `      
      <div>
        <quest-popover :item="quest"></quest-popover>
        <quest-popover :item="quest2"></quest-popover>
      </div>
    `,
});

QuestPopover.story = {
  name: 'questPopover',
};
