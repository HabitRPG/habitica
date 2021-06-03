/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';

import MemberDetails from './memberDetails.vue';
import MemberDetailsNew from './memberDetailsNew.vue';
import { userStyles } from '../../config/storybook/mock.data';

storiesOf('Member Details', module)
  .add('party header (old)', () => ({
    components: { MemberDetails },
    template: `
      <div style="position: absolute; margin: 20px">
        <member-details :member="user"></member-details>
      </div>
    `,
    data () {
      return {
        user: userStyles,
      };
    },
  }))
  .add('quest participants (new)', () => ({
    components: { MemberDetailsNew },
    template: `
      <div style="position: absolute; margin: 20px">
        <member-details-new :member="user"></member-details-new>
      </div>
    `,
    data () {
      return {
        user: userStyles,
      };
    },
  }));
