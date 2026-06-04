<template>
  <b-modal
    id="message-participants-modal"
    :title="$t('messageParticipantsTitle')"
    size="md"
    :hide-footer="true"
  >
    <div class="message-participants-modal">
      <textarea
        v-model="message"
        class="form-control"
        dir="auto"
        :aria-label="$t('messageParticipantsTitle')"
        :maxlength="MAX_MESSAGE_LENGTH"
      ></textarea>
      <div class="message-meta">
        <div
          class="guidelines"
          v-html="$t('communityGuidelinesIntro')"
        ></div>
        <span>{{ currentLength }} / {{ MAX_MESSAGE_LENGTH }}</span>
      </div>
      <div class="modal-actions">
        <button
          class="btn btn-secondary"
          type="button"
          @click="close"
        >
          {{ $t('cancel') }}
        </button>
        <button
          class="btn btn-primary"
          type="button"
          :disabled="sendDisabled"
          @click="sendMessage"
        >
          {{ $t('sendMessage') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped lang="scss">
  @import '@/assets/scss/colors.scss';

  .message-participants-modal {
    textarea {
      min-height: 160px;
      resize: vertical;
    }
  }

  .message-meta {
    display: flex;
    justify-content: space-between;
    gap: 1em;
    margin-top: .5em;
    color: $gray-100;
    font-size: 12px;
  }

  .guidelines {
    flex: 1;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: .5em;
    margin-top: 1em;
  }
</style>

<script>
import { MAX_MESSAGE_LENGTH } from '@/../../common/script/constants';
import notifications from '@/mixins/notifications';

export default {
  name: 'MessageParticipantsModal',
  mixins: [notifications],
  props: {
    challengeId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      message: '',
      sending: false,
      MAX_MESSAGE_LENGTH: MAX_MESSAGE_LENGTH.toString(),
    };
  },
  computed: {
    currentLength () {
      return this.message.length;
    },
    sendDisabled () {
      return this.sending || this.message.trim() === '';
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'message-participants-modal');
    },
    async sendMessage () {
      if (this.sendDisabled) return;
      this.sending = true;

      try {
        const response = await this.$store.dispatch('challenges:messageChallengeParticipants', {
          challengeId: this.challengeId,
          message: this.message,
        });
        this.text(this.$t('messageParticipantsSent', {
          sent: response.sent,
          skipped: response.skipped,
        }));
        this.message = '';
        this.close();
      } finally {
        this.sending = false;
      }
    },
  },
};
</script>
