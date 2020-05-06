/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import PinBadge from './pinBadge.vue';

const stories = storiesOf('Pin Badge', module);

stories.addDecorator(withKnobs);

stories
  .add('states', () => ({
    components: { PinBadge },
    template: `
      <div style="position: absolute; margin: 20px">
        <pin-badge :pinned="pinned"></pin-badge>
      </div>
    `,
    props: {
      pinned: {
        default: boolean('Pinned', false),
      },
    },
  }));
