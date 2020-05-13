/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs, number } from '@storybook/addon-knobs';

import CountBadge from './countBadge.vue';

const stories = storiesOf('Count Badge', module);

stories.addDecorator(withKnobs);

stories
  .add('simple', () => ({
    components: { CountBadge },
    template: `
      <div style="position: absolute; margin: 20px">
        <count-badge :count="2" :show="true"></count-badge>
      </div>
    `,
  }))
  .add('bind count', () => ({
    components: { CountBadge },
    template: `
      <div style="position: absolute; margin: 20px">
        <count-badge :count="count" :show="true"></count-badge>
      </div>
    `,
    props: {
      count: {
        default: number('Count', 3),
      },
    },
  }));
