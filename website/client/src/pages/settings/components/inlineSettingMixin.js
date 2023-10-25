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
      mixinData: {
        inlineSettingMixin: {
          modalVisible: false,
          sharedState: sharedInlineSettingStore,
        },
      },
    };
  },
  methods: {
    openModal () {
      if (this.mixinData.inlineSettingMixin.sharedState.inlineSettingAlreadyOpen) {
        if (this.mixinData.inlineSettingMixin.sharedState.inlineSettingUnsavedValues) {
          if (window.confirm(this.$t('confirmCancelChanges'))) {
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
      this.mixinData.inlineSettingMixin.sharedState.markAsOpened(this);
      this.mixinData.inlineSettingMixin.modalVisible = true;

      this.$el.scrollTo({
        behavior: 'smooth',
      });
    },
    _hidePrevious () {
      this.mixinData.inlineSettingMixin.sharedState.instanceOfCurrentlyOpened.resetControls();
      this.mixinData.inlineSettingMixin.sharedState.instanceOfCurrentlyOpened.closeModal();
    },
    /**
     * This is just for the cancel buttons - so that they also ask if there are unchanged values
     */
    requestCloseModal () {
      if (this.mixinData.inlineSettingMixin.sharedState.inlineSettingUnsavedValues && !window.confirm(this.$t('confirmCancelChanges'))) {
        return;
      }

      this.resetControls();
      this.closeModal();
    },
    /**
     * This is for the save methods to call it after they are done
     */
    closeModal () {
      this.mixinData.inlineSettingMixin.modalVisible = false;
      this.mixinData.inlineSettingMixin.sharedState.markAsClosed();
    },
    modalValuesChanged (value = true) {
      this.mixinData.inlineSettingMixin.sharedState.inlineSettingUnsavedValues = value;
    },
    resetControls () {},
  },
};
