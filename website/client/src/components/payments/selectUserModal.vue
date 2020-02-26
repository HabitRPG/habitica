<template>
  <b-modal
    id="select-user-modal"
    :hide-header="true"
    :hide-footer="true"
    @hide="onHide()"
  >
    <h2 class="ml-2">
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
      <div class="ml-2 mr-auto">
        <strong> {{ $t('sendGiftToWhom') }} </strong>
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
        <div class="d-flex justify-content-center align-items-middle mt-3">
          <a
            class="my-auto ml-auto mr-3 cancel-link"
            @click="close()"
          >
            {{ $t('cancel') }}
          </a>
          <button
            class="btn btn-primary my-auto mr-auto"
            type="submit"
            :disabled="searchCannotSubmit"
            @click="selectUser()"
          >
            {{ $t('selectGift') }}
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/modal.scss';

  #select-user-modal {
    @include centeredModal();

    .modal-dialog {
      width: 29.5rem;
      margin-top: 25vh;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  a:not([href]) {
    color: $blue-10;
    font-size: 16px;
  }

  .form-control {
    width: 26.5rem;
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

    .heading {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .details {
      padding: 0rem 6rem;
    }
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
      this.$root.$emit('habitica::dismiss-modal', 'select-user-modal');
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
      if (!result || !result.data || !result.data.data) {
        this.userNotFound = true;
        return;
      }
      this.userNotFound = false;
      this.foundUser = result.data.data;
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
