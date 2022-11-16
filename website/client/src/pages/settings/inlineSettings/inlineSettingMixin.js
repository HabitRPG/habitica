export const InlineSettingMixin = {
  data () {
    return {
      show: false,
    };
  },
  methods: {
    resetAndClose () {
      this.show = false;
    },
  },
};
