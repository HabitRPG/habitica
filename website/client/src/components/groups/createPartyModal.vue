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
          <h1
            v-once
            class="mb-2"
          >
            {{ $t('playInPartyTitle') }}
          </h1>
          <p
            v-once
            class="mb-4"
          >
            {{ $t('playInPartyDescription') }}
          </p>
          <button
            v-once
            class="btn btn-primary px-4 mb-2"
            @click="createParty()"
          >
            {{ $t('createParty') }}
          </button>
        </div>
      </div>
      <close-x
        @close="close()"
      />
    </div>
    <div class="row grey-row">
      <div class="col-12 text-center px-0">
        <div class="join-party"></div>
        <h1
          v-once
          class="mb-2"
        >
          {{ $t('wantToJoinPartyTitle') }}
        </h1>
        <p
          v-once
          class="mb-4"
          v-html="$t('partyFinderDescription')"
        >
        </p>
        <div
          v-if="seeking"
        >
          <div
            class="green-bar mb-3"
          >
            {{ $t('currentlyLookingForParty') }}
          </div>
          <div class="d-flex justify-content-center">
            <div
              class="red-link"
              @click="seekParty()"
            >
              {{ $t('leave') }}
            </div>
          </div>
        </div>
        <button
          v-else
          class="btn btn-primary px-4 mt-2 mb-1"
          @click="seekParty()"
        >
          {{ $t('lookForParty') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #create-party-modal {
    display: flex !important;
    overflow-y: hidden;

    @media (max-height: 770px) {
      overflow-y: auto;
    }

    .modal-body {
      padding: 0rem 0.75rem;
    }

    .modal-content {
      border-radius: 8px;
    }

    .modal-dialog {
      width: 566px;
      margin: auto;

      @media (max-height: 826px) {
        margin-top: 56px;
      }
    }

    .modal-header {
      padding: 0;
      border-bottom: 0px;
    }
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

  .green-bar {
    height: 32px;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    text-align: center;
    color: $green-1;
    background-color: $green-100;
    border-radius: 2px;
    padding: 4px 0px 4px 0px;
  }

  .grey-row {
    background-color: $gray-700;
    color: #4e4a57;
    padding: 2em;
    border-radius: 0px 0px 8px 8px;
  }

  h1 {
    color: $purple-300;
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

  p {
    line-height: 1.71;
  }

  .red-link {
    cursor: pointer;
    font-size: 14px;
    line-height: 1.71;
    text-align: center;
    color: $maroon-50;
    &:hover {
      text-decoration: underline;
    }
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
import closeX from '../ui/closeX';

import copyIcon from '@/assets/svg/copy.svg';

export default {
  components: {
    closeX,
  },
  mixins: [notifications],
  data () {
    return {
      icons: Object.freeze({
        copy: copyIcon,
      }),
      seeking: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.seeking = Boolean(this.user.party.seeking);
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
      await this.$router.push('/party');
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'create-party-modal');
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
    seekParty () {
      this.$store.dispatch('user:set', {
        'party.seeking': !this.user.party.seeking ? new Date() : null,
      });
      this.seeking = !this.seeking;
    },
  },
};
</script>
