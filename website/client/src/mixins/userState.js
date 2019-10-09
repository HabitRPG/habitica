import { mapState } from '@/libs/store';

export const userStateMixin = {
  computed: {
    ...mapState({ user: 'user.data' }),
  },
};
