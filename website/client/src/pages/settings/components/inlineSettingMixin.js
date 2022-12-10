import { reactive } from 'vue';

export const sharedInlineSettingStore = reactive({
  inlineSettingAlreadyOpen: false,
  inlineSettingUnsavedValues: false,
  /**
   * @type InlineSettingMixin
   */
  instanceOfCurrentlyOpened: null,
  markAsOpened (currentInstance) {
    this.inlineSettingAlreadyOpen = true;
    this.instanceOfCurrentlyOpened = currentInstance;
  },
  markAsClosed () {
    this.inlineSettingUnsavedValues = false;
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
        if (this.sharedState.inlineSettingUnsavedValues) {
          if (window.confirm('Are you sure? You will lose your unsaved changes.')) {
            this._hidePrevious();
            this._openIt();
          } else {
            return;
          }
        } else {
          this._hidePrevious();
        }
      }

      this._openIt();
    },
    _openIt () {
      this.sharedState.markAsOpened(this);
      this.modalVisible = true;
    },
    _hidePrevious () {
      this.sharedState.instanceOfCurrentlyOpened.resetControls();
      this.sharedState.instanceOfCurrentlyOpened.closeModal();
    },
    closeModal () {
      this.modalVisible = false;
      this.sharedState.markAsClosed();
    },
    modalValuesChanged () {
      this.sharedState.inlineSettingUnsavedValues = true;
    },
    resetControls () {},
  },
};
