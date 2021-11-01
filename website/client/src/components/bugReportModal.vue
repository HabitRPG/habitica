<template>
  <b-modal
    id="bug-report-modal"
    size="md"
    :hide-footer="true"
  >
    <div
      slot="modal-header"
      class="bug-report-modal-header"
    >
      <h2 v-once>
        {{ $t('reportBug') }}
      </h2>

      <div v-once>
        {{ $t('reportBugDescribe') }}
      </div>

      <div class="dialog-close">
        <close-icon @click="close()"/>
      </div>
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
          <div class="mb-2" v-once>
            {{ $t('reportEmailText') }}
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

          <div class="error-label mt-2" v-if="emailInvalid">
            {{ $t('reportEmailError') }}
          </div>
        </div>

        <label v-once>
          {{ $t('reportDescription') }}
        </label>
        <div class="mb-2" v-once>
          {{ $t('reportDescriptionText') }}
        </div>
        <textarea
          v-model="message"
          class="form-control"
          rows="5"
          :required="true"
          :placeholder="$t('reportDescriptionPlaceholder')"
          :class="{'input-invalid': messageInvalid && this.message.length === 0}"
        >

        </textarea>

        <button
          class="btn btn-primary submit-button btn-block mx-auto mt-4"
          type="submit"
          :disabled="!message || !emailValid"
        >
          {{ $t('submitBugReport') }}
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
  padding: 2rem 3rem 1.5rem 1.5rem;

  background-image: linear-gradient(288deg, #{$purple-200}, #{$purple-300});
}

label {
  font-weight: bold;
}

.cancel-link {
  color: $blue-10;
}

.submit-button {
  width: auto;
}
</style>

<script>
import axios from 'axios';
import isEmail from 'validator/lib/isEmail';
import closeIcon from '@/components/shared/closeIcon';

export default {
  components: {
    closeIcon,
  },
  data () {
    return {
      message: '',
      email: '',
      messageInvalid: false,
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
      });
    },
  },
  computed: {
    emailValid () {
      if (this.email.length <= 3) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length <= 3) return false;
      return !this.emailValid;
    },
  },
};
</script>
