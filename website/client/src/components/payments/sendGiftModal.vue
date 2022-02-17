<template>
  <b-modal
    id="send-gift"
    :title="title"
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
      <div>
        <member-details
          :member="userReceivingGift"
          :condensed="true"
          :classBadgePosition="false"
          class="d-flex flex-column mx-auto align-items-center"
        />
        <h3 class="d-flex flex-column mx-auto align-items-center">WHY IS THIS SO HARD</h3>
        <h4 class="d-flex flex-column mx-auto align-items-center">i don't know</h4>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  #send-gift {

    .modal-header {
      padding-top: 0.6rem;
      padding-bottom: 0.6rem;
      border-bottom: 0;
    }

    .modal-body {
    }

    .input-group {
    }

    .modal-dialog {
    }

    .modal-footer {
      padding: 0rem;

      > * {
        margin: 0rem 0.25rem 0.25rem 0.25rem;
      }
    }
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

  // .subscribe-option {
  //   border-bottom: 1px solid $gray-600;
  // }

  .svg-amazon-pay {
    width: 208px;
  }

  .svg-close {
    width: 26px;
    height: 26px;

    & ::v-deep svg path {
      stroke: $white;
      stroke-width: 3;
    }
  }

  .svg-gift-box {
    width: 32px;
    height: 32px;
  }

  .svg-logo {
    width: 256px;
    height: 56px;
  }

  .svg-paypal {
    width: 148px;
    height: 40px;
  }

</style>

<script>
// module imports
// import toArray from 'lodash/toArray';
// import omitBy from 'lodash/omitBy';
// import orderBy from 'lodash/orderBy';

// libs imports
import { mapState } from '@/libs/store';

// mixins imports
// import paymentsMixin from '../../mixins/payments';
// import notificationsMixin from '../../mixins/notifications';

// component imports
// import subscriptionOptions from './settings/subscriptionOptions.vue';
import memberDetails from '../memberDetails';
// import userLink from '../userLink';

// svg imports
import amazonPayLogo from '@/assets/svg/amazonpay.svg';
import closeIcon from '@/assets/svg/close.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import paypalLogo from '@/assets/svg/paypal-logo.svg';

export default {
  components: {
    // subscriptionOptions,
    memberDetails,
    // userLink,
  },
  mixins: [],
  data () {
    return {
      subscription: {
        key: null,
      },
      icons: Object.freeze({
        amazonPayLogo,
        closeIcon,
        creditCardIcon,
        logo,
        paypalLogo,
      }),
      userReceivingGift: null,
      avatarOnly: false,
      displayName: null,
    };
  },
  computed: {
    ...mapState({
    //   currentEventList: 'worldState.data.currentEventList',
    // }),
    // currentEvent () {
    //   return find(this.currentEventList, event => Boolean(event.GiftPromo)
    // || Boolean(event.promo));
      userLoggedIn: 'user.data',
    }),
  },
  mounted () {
    this.$root.$on('habitica::send-gift', data => {
      this.userReceivingGift = data;
      this.$root.$emit('bv::show::modal', 'send-gift');
    });
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
    onHide () {
      this.gift.message = '';
      this.sendingInProgress = false;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'send-gift');
    },
  },
};
</script>
