/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { number, text, withKnobs } from '@storybook/addon-knobs';

import positiveIcon from '@/assets/svg/positive.svg';

const stories = storiesOf('Input-Group', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { },
    template: `
      <div style="position: absolute; margin: 20px">
        <div class="input-group">
          <div class="input-group-prepend positive-addon input-group-icon">
            <div
              class="svg-icon"
              v-html="icon"
            >
            </div>
          </div>
          <input
            v-model="number"
            class="form-control"
            type="number"
            min="0"
            required="required"
            ref="input"
          >
        </div>
        <br />
        <button class="btn btn-dark" @click="$refs.input.focus()">Focus ^</button>

        <br />
        <br />
        <div class="input-group">

          <input
            v-model="number"
            class="form-control"
            type="number"
            min="0"
            required="required"
          >
          <div class="input-group-append positive-addon input-group-icon">
            <div
              class="svg-icon"
              v-html="icon"
            >
            </div>
          </div>
        </div>

      </div>
    `,
    data () {
      return {
        icon: positiveIcon,
      };
    },
    props: {
      text: {
        default: text('Input Text', 'example text'),
      },
      number: {
        default: number('Input Number', 0),
      },
    },
  }));
