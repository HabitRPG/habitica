import { text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'Textarea',
  decorators: [withKnobs],
};

export const States = () => ({
  components: {},
  template: `
      <div style="position: absolute; margin: 20px">
        <textarea autofocus ref="area">Normal {{text}}</textarea>
        <br />
        <button class="btn btn-dark" @click="$refs.area.focus()">Focus ^</button>
        <br />
        <textarea placeholder="placeholder"></textarea>
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
});

States.story = {
  name: 'states',
};
