import { mapState } from '@/libs/store';

export const userStateMixin = { // eslint-disable-line import/prefer-default-export
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    hasPermission (user, permission) {
      return Boolean(user.permissions
        && (user.permissions[permission] || user.permissions.fullAccess));
    },
  },
};
