/**
 * Component Example
 *
 * <current-password-input
 *   :show-forget-password="true"
 *   :is-valid="mixinData.passwordIssues.length === 0"
 *   :invalid-issues="mixinData.passwordIssues"
 *   @passwordValue="updates.password = $event"
 *   />
 */

export const PasswordInputChecksMixin = {
  data () {
    return {
      mixinData: {
        passwordIssues: [],
      },
    };
  },
  methods: {
    clearPasswordIssues () {
      this.mixinData.passwordIssues.length = 0;
    },
    /**
     * @param {() => Promise<void>} promiseCall
     * @returns {Promise<void>}
     */
    async passwordInputCheckMixinTryCall (promiseCall) {
      try {
        // reset previous issues
        this.clearPasswordIssues();

        await promiseCall();
      } catch (axiosError) {
        const message = axiosError.response?.data?.message;

        if (message === this.$t('wrongPassword')) {
          this.mixinData.passwordIssues.push(message);
        }
      }
    },
  },
};
