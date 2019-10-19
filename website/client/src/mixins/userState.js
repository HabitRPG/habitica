import { mapState } from '@/libs/store';

export const userStateMixin = { // eslint-disable-line import/prefer-default-export
  computed: {
    ...mapState({ user: 'user.data' }),
  },
};
