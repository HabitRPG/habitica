import { reactive } from 'vue';

export const sharedInlineSettingStore = reactive({
  inlineSettingAlreadyOpen: false,
  markAsOpened () {
    this.inlineSettingAlreadyOpen = true;
  },
  markAsClosed () {
    this.inlineSettingAlreadyOpen = false;
  },
});

export const InlineSettingMixin = {
  data () {
    return {
      modalVisible: false,
      sharedState: sharedInlineSettingStore,
    };
  },
  methods: {
    openModal () {
      if (this.sharedState.inlineSettingAlreadyOpen) {
        return;
      }

      this.sharedState.markAsOpened();
      this.modalVisible = true;
    },
    closeModal () {
      this.modalVisible = false;
      this.sharedState.markAsClosed();
    },
  },
};
