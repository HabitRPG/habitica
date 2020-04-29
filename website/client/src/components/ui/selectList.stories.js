/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import SelectList from './selectList.vue';
import SelectDifficulty from '../tasks/selectDifficulty';

const stories = storiesOf('Select List', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { SelectList },
    template: `
      <div class="m-xl">
        Hover / Click on:
        <select-list class="m-b-xl"
                     :items="items"
                     :key-prop="'key'"
                     :value="selected"
                     @select="selected = $event">
          <template v-slot:item="{ item }">
            <div v-if="item">
              Template: {{ item?.key }} - {{ item?.value.text }}
            </div>
            <div v-else>
              Nothing selected
            </div>
          </template>
        </select-list>

        Disabled:
        <select-list :disabled="true"
                     :value="selected"
                     :items="items"
                     :key-prop="'key'"
                     class="m-b-xl">
          <template v-slot:item="{ item }">
            Template: {{ item?.key }} - {{ item?.value.text }}
          </template>
        </select-list>

<br/>
        Selected: {{ selected }} <br />

      </div>
    `,
    data () {
      return {
        selected: null,
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
  }))
  .add('difficulty', () => ({
    components: { SelectDifficulty },
    template: `
      <div class="m-xl">
        <select-difficulty>

        </select-difficulty>
      </div>
    `,
    data () {
      return {

      };
    },
  }));
