import FaceAvatar from './faceAvatar.vue';
import Avatar from './avatar.vue';
import { userStyles } from '../../config/storybook/mock.data';
import content from '../../../common/script/content/index';
import getters from '@/store/getters';

export default {
  title: 'Face Avatar',
};

export const Simple = () => ({
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
});

Simple.story = {
  name: 'simple',
};

export const Compare = () => ({
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
});

Compare.story = {
  name: 'compare',
};
