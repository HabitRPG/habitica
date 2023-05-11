<template>
  <b-modal
    id="select-user-modal"
    :hide-header="true"
    :hide-footer="!currentEvent || currentEvent.promo !== 'g1g1'"
    @hide="onHide()"
  >
    <div
      v-if="currentEvent && currentEvent.promo === 'g1g1'"
      class="g1g1 d-flex flex-column text-center justify-content-center align-items-center"
    >
      <h1> {{ $t('g1g1') }} </h1>
      <p> {{ $t('g1g1Returning') }} </p>
    </div>
    <h2
      v-else
      class="d-flex flex-column mx-auto align-items-center"
    >
      {{ $t('sendAGift') }}
    </h2>
    <div
      v-if="currentEvent && currentEvent.promo === 'g1g1'"
      class="g1g1-margin d-flex flex-column align-items-center"
    >
    <div
      class="svg-big-gift"
      v-once
      v-html="icons.bigGift"
    ></div>
    </div>
    <div
    v-else
    class="d-flex flex-column align-items-center">
      <div
        class="svg-big-gift"
        v-once
        v-html="icons.bigGift"
      ></div>
    </div>
    <div class="d-flex flex-column align-items-center">
      <div
        v-if="currentEvent && currentEvent.promo === 'g1g1'"
        class="g1g1-modal-close"
        @click="close()"
      >
        <div
          class="g1g1-svg-icon"
          v-html="icons.close"
        ></div>
      </div>
      <div
      v-else
      class="modal-close"
      @click="close()">
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
            ref="textBox"
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
              {{ $t('next') }}
            </div>
          </button>
          <div
          v-if="currentEvent && currentEvent.promo ==='g1g1'"
          class="g1g1-cancel d-flex justify-content-center"
          v-html="$t('cancel')"
          @click="close()"
          >
          {{ $t('cancel') }}
        </div>
        <div
        v-else>
        </div>
        </div>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="g1g1-fine-print text-center pt-3"
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
    .modal-content {
      width:448px;
    }

    .input-group {
      margin-top: 0rem;
    }

    .modal-dialog {
      width: 448px;
    }

    .modal-footer {
      padding: 0rem;

      > * {
        margin: 0rem 0.25rem 0.25rem 0.25rem;
      }
    }

    body.modal-open .modal {
      display: flex !important;
      height: 100%;
    }

    body.modal-open .modal .modal-dialog {
        margin: auto;
    }
}
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  a:not([href]) {
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
    background-size: 446px 152px;
    width: 446px;
    height: 152px;
    margin: -16px 0px 0px -16px;
    border-radius: 4.8px 4.8px 0px 0px;
    padding: 24px;
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

  .g1g1-margin {
    margin-top: 24px;
  }

  .g1g1-cancel {
    margin-top: 16px;
    color: $blue-10;
    cursor: pointer;
  }

  .g1g1-fine-print {
    color: $gray-100;
    background-color: $gray-700;
    font-size: 0.75rem;
    line-height: 1.33;
  }

  .g1g1-modal-close {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 4px;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .g1g1-svg-icon {
      width: 12px;
      height: 12px;

      & ::v-deep svg path {
        fill: #FFFFFF;
      }
    }
  }

  .g1g1-modal-dialog {
    margin-top: 10vh;
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

  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: $purple-300;
    padding-top: 1rem;
  }

  .svg-big-gift {
    width: 176px;
    height: 64px;
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
// import { nextTick } from 'vue'; // may not need this? I don't know!
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import isUUID from 'validator/lib/isUUID';
import { mapState } from '@/libs/store';
import closeIcon from '@/assets/svg/close.svg';
import bigGiftIcon from '@/assets/svg/big-gift.svg';

export default {
  data () {
    return {
      userNotFound: false,
      userSearchTerm: '',
      foundUser: {},
      icons: Object.freeze({
        close: closeIcon,
        bigGift: bigGiftIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    currentEvent () {
      return find(this.currentEventList, event => Boolean(event.gemsPromo) || Boolean(event.promo));
    },
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
      this.$root.$emit('habitica::send-gift', this.foundUser);
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
