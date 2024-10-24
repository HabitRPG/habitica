export default {
  methods: {
    sanitizeRedirect (redirect) {
      if (!redirect) {
        return '/';
      }
      if (process.env.TRUSTED_DOMAINS.split(',').includes(redirect)) {
        return redirect;
      }
      if (redirect.slice(0, 1) !== '/' || redirect.slice(1, 1) === '/') {
        return '/';
      }
      return redirect;
    },
  },
};
