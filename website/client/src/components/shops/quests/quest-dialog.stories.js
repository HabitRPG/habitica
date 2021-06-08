/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import { quests } from '@/../../common/script/content/quests';
import questRewards from './questRewards';
import itemWithLabel from '../itemWithLabel';
import questPopover from './questPopover';

const stories = storiesOf('Quests/Sub Components', module);

stories.addDecorator(withKnobs);

stories
  .add('questRewads', () => ({
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
  }))
  .add('itemWithLabel', () => ({
    components: { itemWithLabel },
    data () {
      return {
      };
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
  }))
  .add('questPopover', () => ({
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
  }));
