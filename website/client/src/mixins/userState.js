import { mapState } from 'client/libs/store';

export const userStateMixin = {
  computed: {
    ...mapState({user: 'user.data'}),
  },
};
