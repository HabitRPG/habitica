import { mapState } from '@/libs/store';

export const userCustomStateMixin = fieldname => {
  const map = { };
  map[fieldname] = 'user.data';
  return { // eslint-disable-line import/prefer-default-export
    computed: {
      ...mapState(map),
    },
    methods: {
      hasPermission (user, permission) {
        return Boolean((user.permissions
          && (user.permissions[permission] || user.permissions.fullAccess))
          || (user.contributor && user.contributor.admin));
      },
    },
  };
};

export const userStateMixin = userCustomStateMixin('user');
