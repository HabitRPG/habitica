/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';

import CountBadge from './countBadge.vue';

storiesOf('Count Badge', module)
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
    data () {
      return {
        count: 3,
      };
    },
  }));
