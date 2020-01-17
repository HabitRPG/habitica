<template>
  <b-modal
    id="select-user-modal"
    :hide-header="true"
    :hide-footer="true"
    @hide="onHide()"
  >
    <div class="g1g1 mb-4 text-center">
      <div class="heading">
        Gift a Subscription, Get a Subscription
      </div>
      <div class="details">
        Enter your friend's @ username and choose a subscription package.
        You'll receive the same one in return!
      </div>
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="svg-icon"
          v-html="icons.close"
        ></div>
      </div>
    </div>
    <div class="d-flex flex-column align-items-center">
      <div class="mb-2">
        <strong> {{ $t('sendGiftToWhom') }} </strong>
      </div>
      <div
        class="form"
        name="selectUser"
        novalidate="novalidate"
      >
        <div class="form-group mb-3">
          <input
            id="selectUser"
            v-model="userSearchTerm"
            class="form-control"
            type="text"
            :placeholder="$t('usernameOrUserId')"
            :class="{'is-invalid input-invalid': userNotFound}"
          >
          <div
            v-if="userSearchTerm.length > 0 && userNotFound"
            class="input-error"
          >
            {{ $t('userWithUsernameOrUserIdNotFound') }}
          </div>
        </div>
        <div class="d-flex justify-content-center align-items-middle">
          <div
            class="my-auto ml-auto mr-3 cancel-link"
            @click="close()"
          >
            {{ $t('cancel') }}
          </div>
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
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .cancel-link {
    cursor: pointer;
    font-size: 16px;
    color: $blue-10;
  }

  .form-control {
    width: 26.5rem;
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
    margin-top: 5px;
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
import closeIcon from '@/assets/svg/close-teal.svg';

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
      if (!result || !result.data || !result.data.data) {
        this.userNotFound = true;
        return;
      }
      this.userNotFound = false;
      this.foundUser = result.data.data;
    }, 500),
    selectUser () {
      const removeIndex = this.$store.state.modalStack.map(modal => modal.modalId).indexOf('select-user-modal');
      if (removeIndex >= 0) this.$store.state.modalStack.splice(removeIndex, 1);
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
