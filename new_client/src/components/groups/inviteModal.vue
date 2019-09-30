<template lang="pug">
  b-modal#invite-modal(:title='$t(`inviteTo${groupType}`)', :hide-footer='true')
    div
      strong {{ $t('inviteEmailUsername') }}
      .small {{ $t('inviteEmailUsernameInfo') }}
      div(v-for='(invite, index) in invites')
        .input-group
          .d-flex.align-items-center.justify-content-center(v-if='index === invites.length - 1 && invite.text.length === 0')
            .svg-icon.positive-icon(v-html='icons.positiveIcon')
          input.form-control(
            type='text',
            :placeholder='$t("emailOrUsernameInvite")',
            v-model='invite.text',
            v-on:keyup='expandInviteList',
            v-on:change='checkInviteList',
            :class='{"input-valid": invite.valid, "is-invalid input-invalid": invite.valid === false}',
          )
        .input-error.text-center.mt-2(v-if="invite.error") {{ invite.error }}
    .modal-footer.d-flex.justify-content-center
      a.mr-3(@click='close()') {{ $t('cancel') }}
      button.btn.btn-primary(@click='sendInvites()', :class='{disabled: cannotSubmit}', :disabled='cannotSubmit') {{ $t('sendInvitations') }}
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
  @import '~client/assets/scss/colors.scss';

  a:not([href]) {
    color: $blue-10;
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
  import { mapState } from 'client/libs/store';
  import clone from 'lodash/clone';
  import debounce from 'lodash/debounce';
  import filter from 'lodash/filter';
  import forEach from 'lodash/forEach';
  import isEmail from 'validator/lib/isEmail';
  import isUUID from 'validator/lib/isUUID';
  import notifications from 'client/mixins/notifications';
  import positiveIcon from 'assets/svg/positive.svg';

  const INVITE_DEFAULTS = {text: '', error: null, valid: null};

  export default {
    computed: {
      ...mapState({user: 'user.data'}),
      cannotSubmit () {
        const filteredInvites = filter(this.invites, (invite) => {
          return invite.text.length > 0 && !invite.valid;
        });
        if (filteredInvites.length > 0) return true;
      },
      inviter () {
        return this.user.profile.name;
      },
    },
    data () {
      return {
        invites: [clone(INVITE_DEFAULTS), clone(INVITE_DEFAULTS)],
        icons: Object.freeze({
          positiveIcon,
        }),
      };
    },
    methods: {
      checkInviteList: debounce(function checkList () {
        this.invites = filter(this.invites, (invite, index) => {
          return invite.text.length > 0 || index === this.invites.length - 1;
        });
        while (this.invites.length < 2) this.invites.push(clone(INVITE_DEFAULTS));
        forEach(this.invites, (value, index) => {
          if (value.text.length < 1 || isEmail(value.text)) {
            return this.fillErrors(index);
          }
          if (isUUID(value.text)) {
            this.$store.dispatch('user:userLookup', {uuid: value.text})
              .then(res => {
                return this.fillErrors(index, res);
              });
          } else {
            let searchUsername = value.text;
            if (searchUsername[0] === '@') searchUsername = searchUsername.slice(1, searchUsername.length);
            this.$store.dispatch('user:userLookup', {username: searchUsername})
              .then(res => {
                return this.fillErrors(index, res);
              });
          }
        });
      }, 250),
      expandInviteList () {
        if (this.invites[this.invites.length - 1].text.length > 0) this.invites.push(clone(INVITE_DEFAULTS));
      },
      fillErrors (index, res) {
        if (!res || res.status === 200) {
          this.invites[index].error = null;
          if (this.invites[index].text.length < 1) return this.invites[index].valid = null;
          return this.invites[index].valid = true;
        }
        this.invites[index].error = res.response.data.message;
        return this.invites[index].valid = false;
      },
      close () {
        this.invites = [clone(INVITE_DEFAULTS), clone(INVITE_DEFAULTS)];
        this.$root.$emit('bv::hide::modal', 'invite-modal');
      },
      async sendInvites () {
        let invitationDetails = {
          inviter: this.inviter,
          emails: [],
          uuids: [],
          usernames: [],
        };
        forEach(this.invites, (invite) => {
          if (invite.text.length < 1) return;
          if (isEmail(invite.text)) {
            invitationDetails.emails.push({email: invite.text});
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

        const invitesSent = invitationDetails.emails.length + invitationDetails.uuids.length + invitationDetails.usernames.length;
        let invitationString = invitesSent > 1 ? 'invitationsSent' : 'invitationSent';

        this.text(this.$t(invitationString));
        this.close();
      },
    },
    mixins: [notifications],
    props: ['group', 'groupType'],
  };
</script>
