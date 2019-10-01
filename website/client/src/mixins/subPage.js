export const subPageMixin = {
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
