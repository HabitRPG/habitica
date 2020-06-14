import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import CheckList from './checklist.vue';

const stories = storiesOf('CheckList', module);

stories.addDecorator(withKnobs);

stories
  .add('simple', () => ({
    components: { CheckList },
    template: `
      <div style="position: absolute; margin: 20px; background: white">
        <check-list :items.sync="checklist">
          
        </check-list>
        
        <br/>
        <br/>
        Data: <br/>
        {{ checklist }}
      </div>
    `,
    data () {
      return {
        checklist: [
          {
            id: 'c0890cd2-3c69-4889-bf2c-b63ac0ee6628',
            text: 'first',
            completed: false,
          },
          {
            id: '5b913020-b340-4099-9a53-afcd27dc5637',
            text: 'second',
            completed: true,
          },
          {
            id: '77b52a8e-4a0e-4717-9650-55fb5462b42f',
            text: 'third',
            completed: false,
          },
        ],
      };
    },
  }));
