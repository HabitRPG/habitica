<template>
  <b-modal
    id="invite-modal"
    :title="$t(`inviteTo${groupType}`)"
    :hide-footer="true"
  >
    <div>
      <strong>{{ $t('inviteEmailUsername') }}</strong>
      <div class="small">
        {{ $t('inviteEmailUsernameInfo') }}
      </div>
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <div v-for="(invite, index) in invites">
        <div class="input-group">
          <div
            v-if="index === invites.length - 1 && invite.text.length === 0"
            class="d-flex align-items-center justify-content-center"
          >
            <div
              class="svg-icon positive-icon"
              v-html="icons.positiveIcon"
            ></div>
          </div>
          <input
            v-model="invite.text"
            class="form-control"
            type="text"
            :placeholder="$t('emailOrUsernameInvite')"
            :class="{
              'input-valid': invite.valid, 'is-invalid input-invalid': invite.valid === false}"
            @keyup="expandInviteList"
            @input="inviteUpdated(invite)"
          >
        </div>
        <div
          v-if="invite.error"
          class="input-error text-center mt-2"
        >
          {{ invite.error }}
        </div>
      </div>
    </div>
    <div class="modal-footer d-flex justify-content-center">
      <a
        class="mr-3"
        @click="close()"
      >{{ $t('cancel') }}</a>
      <button
        class="btn btn-primary"
        :class="{disabled: cannotSubmit}"
        :disabled="cannotSubmit"
        @click="sendInvites()"
      >
        {{ $t('sendInvitations') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #invite-modal___BV_modal_outer_ {
    .modal-content {
      padding: 0rem 0.25rem;
    }
  }
  #invite-modal___BV_modal_header_.modal-header {
    border-bottom: 0px;
  }
  #invite-modal___BV_modal_header_ {
    .modal-title {
      color: #4F2A93;
      font-size: 24px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  a:not([href]) {
    font-size: 16px;
  }

  .form-control {
    border: 0px;
    color: $gray-50;
  }

  .input-error {
    color: $red-50;
    font-size: 90%;
  }

  .input-group {
    border-radius: 2px;
    border: solid 1px $gray-400;
    margin-top: 0.5rem;
  }

  ::placeholder {
    color: $gray-200;
    opacity: 1;
  }

  .input-group:focus-within {
    border-color: $purple-500;
  }

  .modal-footer {
    border: 0px;
  }

  .positive-icon {
    color: $green-10;
    width: 10px;
    margin: auto 0rem auto 1rem;
  }

  .small {
    color: $gray-200;
    font-size: 12px;
    margin: 0.5rem 0rem 1rem;
  }

</style>

<script>
import clone from 'lodash/clone';
import debounce from 'lodash/debounce';
import isEmail from 'validator/lib/isEmail';
import isUUID from 'validator/lib/isUUID';
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';
import positiveIcon from '@/assets/svg/positive.svg';

const INVITE_DEFAULTS = { text: '', error: null, valid: null };

export default {
  mixins: [notifications],
  props: ['group', 'groupType'],
  data () {
    return {
      invites: [clone(INVITE_DEFAULTS), clone(INVITE_DEFAULTS)],
      icons: Object.freeze({
        positiveIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    cannotSubmit () {
      const filledInvites = this.invites.filter(invite => invite.text.length);
      return !filledInvites.length || filledInvites.some(invite => !invite.valid);
    },
    inviter () {
      return this.user.profile.name;
    },
  },
  methods: {
    inviteUpdated (invite) {
      this.clearErrors(invite);
      this.checkInviteList();
    },
    checkInviteList: debounce(function checkList () {
      this.invites = this.invites.filter(
        (invite, index) => invite.text.length > 0 || index === this.invites.length - 1,
      );
      while (this.invites.length < 2) this.invites.push(clone(INVITE_DEFAULTS));
      this.invites.forEach((value, index) => {
        if (value.text.length < 1 || isEmail(value.text)) {
          return this.fillErrors(index);
        }

        if (isUUID(value.text)) {
          return this.$store.dispatch('user:userLookup', { uuid: value.text })
            .then(res => this.fillErrors(index, res));
        }

        let searchUsername = value.text;
        if (searchUsername[0] === '@') searchUsername = searchUsername.slice(1, searchUsername.length);
        return this.$store.dispatch('user:userLookup', { username: searchUsername })
          .then(res => this.fillErrors(index, res));
      });
    }, 500),
    expandInviteList () {
      if (this.invites[this.invites.length - 1].text.length > 0) {
        this.invites.push(clone(INVITE_DEFAULTS));
      }
    },
    clearErrors (invite) {
      invite.valid = null;
      invite.error = null;
    },
    fillErrors (index, res) {
      if (!res || res.status === 200) {
        this.invites[index].error = null;
        if (this.invites[index].text.length < 1) {
          this.invites[index].valid = null;
          return;
        }

        this.invites[index].valid = true;
        return;
      }
      this.invites[index].error = res.response.data.message;
      this.invites[index].valid = false;
    },
    close () {
      this.invites = [clone(INVITE_DEFAULTS), clone(INVITE_DEFAULTS)];
      this.$root.$emit('bv::hide::modal', 'invite-modal');
    },
    async sendInvites () {
      const invitationDetails = {
        inviter: this.inviter,
        emails: [],
        uuids: [],
        usernames: [],
      };
      this.invites.forEach(invite => {
        if (invite.text.length < 1) return;
        if (isEmail(invite.text)) {
          invitationDetails.emails.push({ email: invite.text });
        } else if (isUUID(invite.text)) {
          invitationDetails.uuids.push(invite.text);
        } else {
          invitationDetails.usernames.push(invite.text);
        }
      });
      await this.$store.dispatch('guilds:invite', {
        invitationDetails,
        groupId: this.group._id,
      });

      const invitesSent = invitationDetails.emails.length
        + invitationDetails.uuids.length + invitationDetails.usernames.length;
      const invitationString = invitesSent > 1 ? 'invitationsSent' : 'invitationSent';

      this.text(this.$t(invitationString));
      this.close();
    },
  },
};
</script>
