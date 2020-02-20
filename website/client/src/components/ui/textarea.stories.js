/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { text, withKnobs } from '@storybook/addon-knobs';

const stories = storiesOf('Textare', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { },
    template: `
      <div style="position: absolute; margin: 20px">
        <textarea autofocus ref="area">Normal {{text}}</textarea>  <button @click="$refs.area.focus()">Focus</button>
        <br />

        <textarea disabled>Disabled {{text}}</textarea><br />

        <textarea readonly>Readonly {{text}}</textarea> <br />

      </div>
    `,
    props: {
      text: {
        default: text('Area Message', 'example text'),
      },
    },
  }));
