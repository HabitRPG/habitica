<template>
  <b-modal
    id="send-gift"
    :title="title"
    :hide-footer="true"
    size="md"
    @hide="onHide()"
  >
      <div
      class="panel panel-default"
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
    </div>
  </b-modal>
  </b-modal>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

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

// mixins imports
import paymentsMixin from '../../mixins/payments';
import notificationsMixin from '../../mixins/notifications';

// component imports
import subscriptionOptions from './subscriptionOptions.vue';

// svg imports
import amazonPayLogo from '@/assets/svg/amazonpay.svg';
import closeIcon from '@/assets/svg/close.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import logo from '@/assets/svg/habitica-logo-purple.svg';
import paypalLogo from '@/assets/svg/paypal-logo.svg';

export default {
  components: {
    subscriptionOptions,
  },
  mixins:[],
  data() {
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
    },
  },
  computed: {
    ...mapState({
      currentEventList: 'worldState.data.currentEventList',
    }),
    currentEvent () {
      return find(this.currentEventList, event => Boolean(event.gemsPromo) || Boolean(event.promo));
    },
    mounted () {
      this.$root.$on('habitica::send-gift', data => {
        this.userReceivingGems = data;
        this.$root.$emit('bv::show::modal', 'send-gift');
      });
    },
  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
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
