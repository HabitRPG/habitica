/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import SelectList from './selectList.vue';
import SelectDifficulty from '../tasks/modal-controls/selectDifficulty';
import SelectTranslatedArray from '../tasks/modal-controls/selectTranslatedArray';

const stories = storiesOf('Select List', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { SelectList },
    template: `
      <div class="m-xl">
        Hover / Click on:
        <select-list class="mb-4"
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
                     class="mb-4">
          <template v-slot:item="{ item }">
            Template: {{ item?.key }} - {{ item?.value.text }}
          </template>
        </select-list>

        <br/>
        Selected: {{ selected }} <br/>

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
        <select-difficulty
          :value="selected"
          @select="selected = $event"
        >

        </select-difficulty>

        Selected: {{ selected }}
      </div>
    `,
    data () {
      return {
        selected: 2,
      };
    },
  }))
  .add('translated array', () => ({
    components: { SelectTranslatedArray },
    template: `
      <div class="m-xl">
        <select-translated-array
          :items="['daily', 'weekly', 'monthly']"
          :value="selected"
          @select="selected = $event"
        >

        </select-translated-array>

        Selected: {{ selected }}
      </div>
    `,
    data () {
      return {
        selected: 'weekly',
      };
    },
  }));
