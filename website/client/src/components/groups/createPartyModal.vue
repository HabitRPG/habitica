<template>
  <b-modal
    id="create-party-modal"
    size="lg"
    hide-footer="hide-footer"
  >
    <div
      slot="modal-header"
      class="header-wrap"
    >
      <div class="quest_screen"></div>
      <div class="row heading">
        <div class="col-12 text-center pr-5 pl-5">
          <h2 v-once>
            {{ $t('playInPartyTitle') }}
          </h2>
          <p
            v-once
            class="mb-4"
          >
            {{ $t('playInPartyDescription') }}
          </p>
          <button
            v-once
            class="btn btn-primary"
            @click="createParty()"
          >
            {{ $t('createParty') }}
          </button>
        </div>
      </div>
    </div>
    <div class="row grey-row">
      <div class="col-12 text-center">
        <div class="join-party"></div>
        <h2 v-once>
          {{ $t('wantToJoinPartyTitle') }}
        </h2>
        <p v-html="$t('wantToJoinPartyDescription')"></p>
        <div
          class="form-group"
          @click="copyUsername"
        >
          <div class="d-flex align-items-center">
            <label
              v-once
              class="mr-3"
            >{{ $t('username') }}</label>
            <div class="flex-grow-1">
              <div class="input-group-prepend input-group-text">
                @
                <div class="text">
                  {{ user.auth.local.username }}
                </div>
                <div
                  class="svg-icon copy-icon"
                  v-html="icons.copy"
                ></div>
                <div
                  v-once
                  class="small"
                >
                  {{ $t('copy') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style>
  #create-party-modal .modal-body {
    padding: 0rem 0.75rem;
  }

  #create-party-modal .modal-dialog {
    width: 35.75rem;
  }

  #create-party-modal .modal-header {
    padding: 0;
    border-bottom: 0px;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .copy-icon {
    width: 1rem;
  }

  .form-control[readonly] {
    background-color: $white;
    color: $gray-50;
  }

  .form-group {
    background-color: $gray-600;
    border-radius: 2px;
    border: solid 1px $gray-500;
    width: 90%;
    margin: auto;
    cursor: pointer;
  }

  .grey-row {
    background-color: $gray-700;
    color: #4e4a57;
    padding: 2em;
    border-radius: 0px 0px 2px 2px;
  }

  h2 {
    color: $gray-100;
  }

  .header-wrap {
    padding: 0;
    color: #4e4a57;
    width: 100%;

    .quest_screen {
      background-image: url('~@/assets/images/group@3x.png');
      background-size: cover;
      width: 100%;
      height: 246px;
      margin-bottom: 1.5rem;
      border-radius: 2px 2px 0 0;
      image-rendering: optimizequality;
    }

    h2 {
      color: $purple-200;
    }
  }

  .heading {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  input.form-control {
    border: 0px;
    padding-left: 0.25rem;
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
    background-image: url('~@/assets/images/party.png');
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
    cursor: pointer;
  }

  .modal-dialog .text {
    min-height: 1rem;
    margin: 0.75rem auto 0.75rem 0.25rem;
  }

  .small {
    color: $gray-200;
    margin: auto 0.5rem auto 0.25rem;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';
import notifications from '@/mixins/notifications';

import copyIcon from '@/assets/svg/copy.svg';

export default {
  mixins: [notifications],
  data () {
    return {
      icons: Object.freeze({
        copy: copyIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    async createParty () {
      const group = {
        type: 'party',
      };
      group.name = this.$t('possessiveParty', { name: this.user.profile.name });
      const party = await this.$store.dispatch('guilds:create', { group });
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
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.user.auth.local.username);
      } else {
        const copyText = document.createElement('textarea');
        copyText.value = this.user.auth.local.username;
        document.body.appendChild(copyText);
        copyText.select();
        document.execCommand('copy');
        document.body.removeChild(copyText);
      }
      this.text(this.$t('usernameCopied'));
    },
  },
};
</script>
