export const subPageMixin = { // eslint-disable-line import/prefer-default-export
  data () {
    return {
      activeSubPage: '',
    };
  },
  methods: {
    changeSubPage (page) {
      this.activeSubPage = page;
    },
  },
};
