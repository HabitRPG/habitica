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
        checklist: [],
      };
    },
  }));
