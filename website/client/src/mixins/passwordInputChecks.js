/**
 * Component Example
 *
 * <current-password-input
 *   :show-forget-password="true"
 *   :is-valid="mixinData.currentPasswordIssues.length === 0"
 *   :invalid-issues="mixinData.currentPasswordIssues"
 *   @passwordValue="updates.password = $event"
 *   />
 */

export const PasswordInputChecksMixin = {
  data () {
    return {
      mixinData: {
        currentPasswordIssues: [],
        newPasswordIssues: [],
        confirmPasswordIssues: [],
      },
    };
  },
  methods: {
    clearPasswordIssues () {
      this.mixinData.currentPasswordIssues.length = 0;
      this.mixinData.newPasswordIssues.length = 0;
      this.mixinData.confirmPasswordIssues.length = 0;
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

        if ([this.$t('wrongPassword'), this.$t('missingPassword')].includes(message)) {
          this.mixinData.currentPasswordIssues.push(message);
        } else if ([this.$t('missingNewPassword'), this.$t('passwordIssueLength'), this.$t('passwordConfirmationMatch')].includes(message)) {
          this.mixinData.newPasswordIssues.push(message);
          this.mixinData.confirmPasswordIssues.push(message);
        } else if (this.$t('invalidReqParams') === message) {
          const errors = axiosError.response?.data?.errors ?? [];

          for (const error of errors) {
            if (error.param === 'password') {
              this.mixinData.currentPasswordIssues.push(error.message);
            } else if (error.param === 'newPassword') {
              this.mixinData.newPasswordIssues.push(error.message);
            } else {
              this.mixinData.confirmPasswordIssues.push(error.message);
            }
          }
        }
      }
    },
  },
};
