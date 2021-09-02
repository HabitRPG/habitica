/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';

import FaceAvatar from './faceAvatar.vue';
import Avatar from './avatar.vue';
import { userStyles } from '../../config/storybook/mock.data';
import content from '../../../common/script/content/index';
import getters from '@/store/getters';

storiesOf('Face Avatar', module)
  .add('simple', () => ({
    components: { FaceAvatar },
    template: `
      <div style="position: absolute; margin: 20px">
        <face-avatar :member="user"></face-avatar>
      </div>
    `,
    data () {
      return {
        user: userStyles,
      };
    },
  }))
  .add('compare', () => ({
    components: { FaceAvatar, Avatar },
    template: `
      <div style="position: absolute; margin: 20px">
        <face-avatar :member="user"></face-avatar>
        <avatar :member="user"></avatar>
      </div>
    `,
    data () {
      return {
        user: userStyles,
      };
    },
    state: {
      content,
    },
    store: {
      getters,
      state: {
        content,
      },
    },
  }));
