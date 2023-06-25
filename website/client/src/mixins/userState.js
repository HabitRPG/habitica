import { mapState } from '@/libs/store';

export const userCustomStateMixin = fieldname => {
  const map = { };
  map[fieldname] = 'user.data';
  return {
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
