/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import SelectList from './selectList.vue';

const stories = storiesOf('Select List', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { SelectList },
    template: `
      <div class="m-xl">
        <select-list class="m-b-xl" :value="'Default'"></select-list>
        <select-list class="disabled" :value="'Disabled'"></select-list>
      </div>
    `,
    props: {
      value: {
        default: 'Value',
      },
    },
  }));
