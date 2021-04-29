<template>
  <b-modal
    id="select-user-modal"
    :hide-header="true"
    :hide-footer="!currentEvent || currentEvent.promo !== 'g1g1'"
    @hide="onHide()"
  >
    <div
      class="g1g1 d-flex flex-column text-center justify-content-center align-items-center"
      v-if="currentEvent && currentEvent.promo === 'g1g1'"
    >
      <h1> {{ $t('g1g1') }} </h1>
      <p> {{ $t('g1g1Returning') }} </p>
    </div>
    <h2
      class="ml-2"
      v-else
    >
      {{ $t('sendGift') }}
    </h2>
    <div class="d-flex flex-column align-items-center">
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="svg-icon"
          v-html="icons.close"
        ></div>
      </div>
      <div class="mx-auto mt-3">
        <h3> {{ $t('sendGiftToWhom') }} </h3>
      </div>
      <div
        class="form"
        name="selectUser"
        novalidate="novalidate"
      >
        <div class="input-group">
          <input
            id="selectUser"
            v-model="userSearchTerm"
            class="form-control"
            type="text"
            :placeholder="$t('usernameOrUserId')"
            :class="{
              'input-valid': foundUser._id,
              'is-invalid input-invalid': userNotFound,
            }"
          >
        </div>
        <div
          v-if="userSearchTerm.length > 0 && userNotFound"
          class="input-error text-center mt-2"
        >
          {{ $t('userWithUsernameOrUserIdNotFound') }}
        </div>
        <div class="d-flex flex-column justify-content-center align-items-middle mt-3">
          <button
            class="btn btn-primary mx-auto mt-2"
            type="submit"
            :disabled="searchCannotSubmit"
            @click="selectUser()"
          >
            <div
              v-if="currentEvent && currentEvent.promo === 'g1g1'"
            >
              {{ $t('selectSubscription') }}
            </div>
            <div
              v-else
            >
              {{ $t('selectGift') }}
            </div>
          </button>
          <a
            class="cancel-link mx-auto mt-3"
            @click="close()"
            >
            {{ $t('cancel') }}
          </a>
        </div>
      </div>
    </div>
    <div
      class="g1g1-fine-print text-center pt-3"
      slot="modal-footer"
    >
      <strong>
        {{ $t ('howItWorks') }}
      </strong>
      <p
        class="mx-5 mt-1"
      >
        {{ $t ('g1g1HowItWorks') }}
      </p>
      <strong>
        {{ $t ('limitations') }}
      </strong>
      <p
        class="mx-5 mt-1"
      >
        {{ $t ('g1g1Limitations') }}
      </p>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  #select-user-modal {
    .input-group {
      margin-top: 0rem;
    }

    .modal-dialog {
      width: 29.5rem;
      margin-top: 25vh;
    }

    .modal-footer {
      padding: 0rem;

      > * {
        margin: 0rem 0.25rem 0.25rem 0.25rem;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  a:not([href]) {
    color: $blue-10;
    font-size: 0.875rem;
    line-height: 1.71;
  }

  #selectUser {
    width: 22rem;
    border: 0px;
    color: $gray-50;
  }

  .g1g1 {
    background-image: url('~@/assets/images/g1g1-send.png');
    background-size: 472px 152px;
    width: 470px;
    height: 152px;
    margin: -1rem 0rem 0rem -1rem;
    border-radius: 0.3rem 0.3rem 0rem 0rem;
    padding: 1.5rem;
    color: $white;

    h1 {
      font-size: 1.25rem;
      line-height: 1.4;
      color: $white;
    }

    p {
      font-size: 0.75rem;
      line-height: 1.33;
      margin-left: 4rem;
      margin-right: 4rem;
      margin-bottom: 0rem;
    }
  }

  .g1g1-fine-print {
    color: $gray-100;
    background-color: $gray-700;
    font-size: 0.75rem;
    line-height: 1.33;
  }

  .input-error {
    color: $red-50;
    font-size: 90%;
    width: 100%;
  }

  .input-group {
    border-radius: 2px;
    border: solid 1px $gray-400;
    margin-top: 0.5rem;
  }

  .input-group:focus-within {
    border-color: $purple-500;
  }

  .modal-close {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 4px;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .svg-icon {
      width: 12px;
      height: 12px;
    }
  }
</style>

<script>
import debounce from 'lodash/debounce';
import isUUID from 'validator/lib/isUUID';
import { mapState } from '@/libs/store';
import closeIcon from '@/assets/svg/close.svg';

export default {
  data () {
    return {
      userNotFound: false,
      userSearchTerm: '',
      foundUser: {},
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      currentEvent: 'worldState.data.currentEvent',
    }),
    searchCannotSubmit () {
      if (this.userSearchTerm.length < 1) return true;
      return typeof this.foundUser._id === 'undefined';
    },
  },
  watch: {
    userSearchTerm: {
      handler () {
        this.searchUser(this.userSearchTerm);
      },
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'select-user-modal');
    },
    searchUser: debounce(async function userSearch (searchTerm) {
      this.foundUser = {};
      if (searchTerm.length < 1) {
        this.userNotFound = false;
        return;
      }
      let result;
      if (isUUID(searchTerm)) {
        try {
          result = await this.$store.dispatch('members:fetchMember', {
            memberId: searchTerm,
          });
        } catch {
          result = null;
        }
      } else {
        try {
          result = await this.$store.dispatch('members:fetchMemberByUsername', {
            username: searchTerm,
          });
        } catch {
          result = null;
        }
      }
      if (!result) {
        this.userNotFound = true;
        return;
      }
      this.userNotFound = false;
      this.foundUser = result;
    }, 500),
    selectUser () {
      this.$root.$emit('habitica::send-gems', this.foundUser);
      this.close();
    },
    onHide () {
      this.userNotFound = false;
      this.userSearchTerm = '';
      this.foundUser = {};
    },
  },
};
</script>
