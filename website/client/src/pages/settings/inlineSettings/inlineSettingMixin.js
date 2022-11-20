export const InlineSettingMixin = {
  data () {
    return {
      modalVisible: false,
    };
  },
  methods: {
    closeModal () {
      this.modalVisible = false;
    },
  },
};
