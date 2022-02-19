<template>
  <b-modal
    id="send-gift"
    :hide-footer="true"
    size="md"
    @hide="onHide()"
  >
    <div
    class="panel"
      >
      <h2
        class="d-flex flex-column mx-auto align-items-center"
      >
        {{ $t('sendAGift') }}
      </h2>
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="svg-icon"
          v-html="icons.close"
        ></div>
      </div>
        <div
        v-if="userReceivingGift"
        >
          <!-- user avatar -->
          <member-details
            :member="userReceivingGift"
            :condensed="true"
            :classBadgePosition="'hidden'"
            class="d-flex flex-column mx-auto align-items-center"
          />
          <div>
            <!-- user profile name and @username except it's not the right one -->
            <h1 class= "flex-spacer">{{ userReceivingGift.profile.name }}</h1>
            <div
              v-if="userReceivingGift.auth
              && userReceivingGift.auth.local
              && userReceivingGift.auth.local.username"
              class="name"
            >
              @{{ userReceivingGift.auth.local.username }}
            </div>
        </div>
      </div>
      <div>
        <subscription-options />
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  #send-gift {

    .modal-header {
      padding-top: 0rem;
      padding-bottom: 0rem;
      border-bottom: 0;
    }

    .modal-body {
    }

    .input-group {
    }

    .modal-dialog {
    }

    // .modal-footer {
    //   padding: 0rem;
    //
    //   > * {
    //     margin: 0rem 0.25rem 0.25rem 0.25rem;
    //   }
    // }
  }
</style>
<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-300;
    font-size: 1.25rem;
  }

  .extra-months {
    border-radius: 2px;
    border: 1px solid $green-50;
  }

  .flex-spacer {
    width: 4rem;
  }

  .gray-10 {
    color: $gray-10;
  }

  .gray-50 {
    color: $gray-50;
  }

  .green-10 {
    color: $green-10;
  }

  .header-mini {
    font-size: 12px;
    font-weight: bold;
  }

  .subscribe-option {
    border-bottom: 1px solid $gray-600;
  }

  .svg-close {
    width: 26px;
    height: 26px;

    & ::v-deep svg path {
      stroke: $white;
      stroke-width: 3;
    }
  }

</style>

<script>

// libs imports
// import { mapState } from '@/libs/store';

// mixins imports
import paymentsMixin from '../../mixins/payments';

// component imports
import subscriptionOptions from '../settings/subscriptionOptions.vue';
import memberDetails from '../memberDetails';


// svg imports
// import amazonPayLogo from '@/assets/svg/amazonpay.svg';
import closeIcon from '@/assets/svg/close.svg';
// import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
// import logo from '@/assets/svg/habitica-logo-purple.svg';
// import paypalLogo from '@/assets/svg/paypal-logo.svg';

export default {
  components: {
    subscriptionOptions,
    memberDetails,
  },
  mixins: [
    paymentsMixin,
  ],
  data () {
    return {
      subscription: {
        key: null,
      },
      icons: Object.freeze({
        // amazonPayLogo,
        closeIcon,
        // creditCardIcon,
        // logo,
        // paypalLogo,
      }),
      userReceivingGift: null,
      avatarOnly: false,
      displayName: null,
    };
  },
  computed: {

  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
    // why is this not working? I do not know! doublecheck with sendGemsModal.vue
    receiverUserName () {
      if (
        this.userReceivingGift.auth
        && this.userReceivingGift.auth.local
        && this.userReceivingGift.auth.local.username
      ) {
        return this.userReceivingGift.auth.local.username;
      }
      return this.userReceivingGems.profile.name;
    },
    // we'll need this later
    // onHide () {
    //   this.gift.message = '';
    //   this.sendingInProgress = false;
    // },
    close () {
      this.$root.$emit('bv::hide::modal', 'send-gift');
    },
  },
  mounted () {
    this.$root.$on('habitica::send-gift', data => {
      console.log(data);
      this.userReceivingGift = data;
      this.$root.$emit('bv::show::modal', 'send-gift');
    });
  },
};
</script>
