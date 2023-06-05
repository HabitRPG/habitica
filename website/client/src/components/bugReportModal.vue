<template>
  <b-modal
    :id="modalId"
    size="md"
    :hide-footer="true"
  >
    <div
      slot="modal-header"
      class="bug-report-modal-header"
    >
      <h2>
        {{ question ? $t('askQuestion') : $t('reportBug') }}
      </h2>
      <div class="report-bug-header-describe">
        {{ question ? $t('askQuestionHeaderDescribe') : $t('reportBugHeaderDescribe') }}
      </div>
      <close-x
        @close="close()"
      />
    </div>
    <div>
      <form
        class="form"
        @submit.prevent.stop="sendBugReport()"
      >
        <div
          class="form-group"
        >
          <label
            v-once
            for="emailInput"
          >
            {{ $t('email') }}
          </label>
          <div class="mb-2 description-label">
            {{ question ? $t('questionEmailText') : $t('reportEmailText') }}
          </div>
          <input
            id="emailInput"
            v-model="email"
            class="form-control"
            type="email"
            :required="true"
            :placeholder="$t('reportEmailPlaceholder')"
            :class="{'input-invalid': emailInvalid, 'input-valid': emailValid}"
          >

          <div
            v-if="emailInvalid"
            class="error-label mt-2"
          >
            {{ $t('reportEmailError') }}
          </div>
        </div>

        <label>
          {{ question ? $t('question') : $t('reportDescription') }}
        </label>
        <div class="mb-2 description-label">
          {{ question ? $t('questionDescriptionText') : $t('reportDescriptionText') }}
        </div>
        <textarea
          v-model="message"
          class="form-control"
          rows="5"
          :required="true"
          :placeholder="question ? $t('questionPlaceholder') : $t('reportDescriptionPlaceholder')"
          :class="{'input-invalid': messageInvalid && this.message.length === 0}"
        >

        </textarea>

        <button
          class="btn btn-primary submit-button btn-block mx-auto mt-4"
          type="submit"
          :disabled="!message || !emailValid"
        >
          {{ question ? $t('submitQuestion') : $t('submitBugReport') }}
        </button>
      </form>
    </div>
    <div class="modal-footer">
      <a
        class="cancel-link mx-auto mb-4"
        @click.prevent="close()"
      >
        {{ $t('cancel') }}
      </a>
    </div>
  </b-modal>
</template>

<style lang="scss">
#bug-report-modal {
  .modal-header {
    padding: 0;
    border: none;
  }

  .modal-dialog {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    overflow: auto;
  }

  .modal-body {
    padding-top: 1rem;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
    padding-bottom: 0;
  }

  .modal-footer {
    border-top: 0;
    padding-bottom: 0;
  }
}
</style>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

h2 {
  color: $white;
}

.bug-report-modal-header {
  color: $white;
  width: 100%;
  padding: 1.5rem 3rem 1.5rem 1.5rem;

  background-image: linear-gradient(288deg, #{$purple-200}, #{$purple-300});
}

.report-bug-header-describe {
  font-size: 14px;
  line-height: 1.71;
  color: $purple-600;
}

label {
  font-weight: bold;
  line-height: 1.71;
  color: $gray-50;
}

.cancel-link {
  line-height: 1.71;
}

.submit-button {
  width: auto;
}

.error-label {
  font-size: 12px;
  line-height: 1.33;
  color: $maroon-10;
}

.description-label {
  font-size: 12px;
  line-height: 1.33;
  color: $gray-100;
}
</style>

<script>
import axios from 'axios';
import isEmail from 'validator/lib/isEmail';
import closeX from '@/components/ui/closeX';
import { mapState } from '@/libs/store';
import { MODALS } from '@/libs/consts';

export default {
  components: {
    closeX,
  },
  data () {
    return {
      message: '',
      email: '',
      messageInvalid: false,
      modalId: MODALS.BUG_REPORT,
    };
  },
  methods: {
    async sendBugReport () {
      this.messageInvalid = false;

      if (this.message.length === 0) {
        this.messageInvalid = true;

        return;
      }

      await axios.post('/api/v4/bug-report', {
        message: this.message,
        email: this.email,
        question: this.question,
      });

      this.message = '';

      this.close();

      this.$root.$emit('bv::show::modal', MODALS.BUG_REPORT_SUCCESS);
    },
    close () {
      this.$root.$emit('bv::hide::modal', MODALS.BUG_REPORT);
    },
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    emailValid () {
      if (this.email.length <= 3) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length <= 3) return false;
      return !this.emailValid;
    },
    question () {
      return this.$store.state.bugReportOptions.question;
    },
  },
  mounted () {
    const { user } = this;

    let email = user.auth?.local?.email;

    if (!email && user.auth?.facebook?.emails) {
      email = user.auth.facebook.emails?.[0]?.value;
    }

    if (!email && user.auth?.google?.emails) {
      email = user.auth.google.emails?.[0]?.value;
    }

    if (!email && user.auth?.apple?.emails) {
      email = user.auth.apple.emails?.[0]?.value;
    }

    this.email = email;
  },
};
</script>
