<template lang="pug">
b-modal#create-party-modal(title="Empty", size='lg', hide-footer=true)
  .header-wrap(slot="modal-header")
    .quest_screen
    .row.heading
      .col-12.text-center.pr-5.pl-5
        h2(v-once) {{ $t('playInPartyTitle') }}
        p(v-once) {{ $t('playInPartyDescription') }}
        button.btn.btn-primary(v-once, @click='createParty()') {{ $t('createParty') }}
  .row.grey-row
    .col-12.text-center
      .join-party
      h3(v-once) {{ $t('wantToJoinPartyTitle') }}
      p(v-html='$t("wantToJoinPartyDescription")')
      .form-group
        .d-flex.align-items-center
          label.mr-3(for='username') {{ $t('username') }}
          .flex-grow-1
            .input-group-prepend.input-group-text @
              input.form-control#username-text(
                type='text',
                v-model='user.auth.local.username',
                readonly='true',
              )
              .svg-icon.copy-icon(v-html='icons.copy', @click='copyUsername')
              .small(@click='copyUsername') {{ $t('copy') }}
</template>

<style>
  #create-party-modal .modal-dialog {
    width: 35.75rem;
  }

  #create-party-modal .modal-header {
    padding: 0;
    border-bottom: 0px;
  }
</style>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  .copy-icon {
    width: 1.25rem;
    cursor: pointer;
  }

  .heading {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    background-color: $gray-700;
    border-radius: 2px;
    border: solid 1px $gray-500;
    width: 90%;
    margin: auto;
  }

  .grey-row {
    background-color: $gray-700;
    color: #4e4a57;
    padding: 2em;
    border-radius: 0px 0px 2px 2px;
  }

  .header-wrap {
    padding: 0;
    color: #4e4a57;
    width: 100%;

    .quest_screen {
      background-image: url('~client/assets/images/group@3x.png');
      background-size: cover;
      width: 100%;
      height: 246px;
      margin-bottom: .5em;
      border-radius: 2px 2px 0 0;
      image-rendering: optimizequality;
    }

    h2 {
      color: #4f2a93;
    }
  }

  input.form-control {
    border: 0px;
    padding-left: 0.25rem;
  }

  .form-control[readonly] {
    background-color: $white;
    color: $gray-50;
  }

  .input-group-prepend {
    margin-right: 0px;
  }

  .input-group-text {
    background-color: $white;
    border: 0px;
    border-radius: 0px;
    color: $gray-300;
    padding: 0rem 0.1rem 0rem 0.75rem;
  }

  .join-party {
    background-image: url('~client/assets/images/party.png');
    background-size: cover;
    width: 203px;
    height: 66px;
    margin: 0 auto;
    margin-bottom: 1em;
  }

  label {
    color: $gray-100;
    font-weight: bold;
    margin-bottom: 0rem;
    margin-left: 1rem;
  }

  .modal-body {
    padding-bottom: 0;
    padding-top: 0;
  }

  .small {
    color: $gray-200;
    margin: auto 0.5rem auto 0.25rem;
    cursor: pointer;
  }
</style>

<script>
  import { mapState } from 'client/libs/store';
  import * as Analytics from 'client/libs/analytics';
  import notifications from 'client/mixins/notifications';

  import copyIcon from 'assets/svg/copy.svg';

  export default {
    data () {
      return {
        icons: Object.freeze({
          copy: copyIcon,
        }),
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    methods: {
      async createParty () {
        let group = {
          type: 'party',
        };
        group.name = this.$t('possessiveParty', {name: this.user.profile.name});
        let party = await this.$store.dispatch('guilds:create', {group});
        this.$store.state.party.data = party;
        this.user.party._id = party._id;

        Analytics.updateUser({
          partyID: party._id,
          partySize: 1,
        });

        this.$root.$emit('bv::hide::modal', 'create-party-modal');
        this.$router.push('/party');
      },
      copyUsername () {
        let copyText = document.createElement('textarea');
        copyText.value = this.user.auth.local.username;
        document.body.appendChild(copyText);
        copyText.select();
        document.execCommand('copy');
        this.text(this.$t('usernameCopied'));
        document.body.removeChild(copyText);
      },
    },
    mixins: [notifications],
  };
</script>
