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
        <select-list class="m-b-xl"
                     :items="items"
                     :key-prop="'key'"
        :value="selected">
          <template v-slot:item="{ item }">
            Template: {{ item?.key }} - {{ item?.value.text }}
          </template>
        </select-list>
        <select-list :disabled="true"></select-list>
      </div>
    `,
    data () {
      return {
        selected: {
          key: 1,
          value: {
            text: 'First',
          },
        },
        items: [
          {
            key: 1,
            value: {
              text: 'First',
            },
          },
          {
            key: 2,
            value: {
              text: 'Second',
            },
          },
        ],
      };
    },
  }));
