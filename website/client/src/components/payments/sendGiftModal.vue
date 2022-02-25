<template>
  <b-modal
    id="send-gift"
    :hide-footer="true"
    size="md"
    @hide="onHide()"
  >
    <div>
      <!-- header -->
      <div
      class="modal-close"
      @click="close()"
      >
      <div
      class="svg-icon"
      v-html="icons.close"
      ></div>
      <h2>
        {{ $t('sendAGift') }}
      </h2>
      </div>
      <!-- user avatar -->
      <div
      v-if="userReceivingGift"
      >
        <avatar
        :member="userReceivingGift"
        :hideClassBadge="true"
        />
      <div>
        <!-- user display name and username -->
        <h1>{{ displayName }}</h1>
      </div>
      <div>
        @{{ userName }}
      </div>
      </div>
      <!-- menu area -->
      <div class="row">
        <div class="col-12 col-md-8 offset-md-2 text-center nav">
          <div
            class="nav-item"
            :class="{active: selectedPage === 'subscription'}"
            @click="selectPage('subscription')"

          >
            {{ $t('subscription') }}
          </div>
          <div
            class="nav-item"
            :class="{active: selectedPage === 'gems'}"
            @click="selectPage('gems')"
          >
            {{ $t('gems') }}
          </div>
        </div>
      </div>
      <!-- subscriber block -->
      <div>
        <subscription-options
        v-show="selectedPage === 'subscription'"
        id="userProfile"
        />
      </div>
      <!-- gem block -->
      <div
      v-show="selectedPage === 'gems'"
      class="standard-page"
      >

        <h3>
          {{ $t('howManyGemsPurchase') }}
        </h3>
        <div>
          <!-- need to figure out the arguments here; also :disabled=0 needs to be set somehow! -->
          <payments-buttons
          :stripe-fn="() => redirectToStripe({ gemsBlock: selectedGemsBlock })"
          :paypal-fn="() => openPaypal({
            url: paypalCheckoutLink, type: 'gems', gemsBlock: selectedGemsBlock
          })"
          :amazon-data="{type: 'single', gemsBlock: selectedGemsBlock}"/>
        </div>
        <h3>
          {{ $t ('howManyGemsSend') }}
        </h3>
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

  .nav {
    font-weight: bold;
    min-height: 40px;
    justify-content: center;
  }

  .nav-item {
    display: inline-block;
    margin: 0 1.2em;
    padding: 1em;
  }

  .nav-item:hover, .nav-item.active {
    color: #4f2a93;
    border-bottom: 2px solid #4f2a93;
    cursor: pointer;
  }

</style>

<script>

// libs imports
// import { mapState } from '@/libs/store';

// mixins imports
import paymentsMixin from '../../mixins/payments';

// component imports
import avatar from '../avatar';
import subscriptionOptions from '../settings/subscriptionOptions.vue';
import paymentsButtons from '@/components/payments/buttons/list';

// svg imports
import closeIcon from '@/assets/svg/close.svg';

export default {
  components: {
    avatar,
    subscriptionOptions,
    paymentsButtons,
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
        closeIcon,
      }),
      userReceivingGift: null,
      // this might need to be computed depending on where $emit is happening
      selectedPage: 'subscription',
      gift: {
        type: 'gems',
        gems: {
          amount: 0,
          fromBalance: true,
        },
      },
    };
  },
  methods: {
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'send-gift');
    },
    selectPage (page) {
      this.selectedPage = page || 'subscription';
      window.history.replaceState(null, null, '');
      this.$store.dispatch('common:setTitle', {
        section: this.$t('subscription'),
        subSection: this.$t(this.startingPage),
      });
    },
    // we'll need this later
    // onHide () {
    //   this.gift.message = '';
    //   this.sendingInProgress = false;
    // },
  },
  computed: {
    userName () {
      const userName = this.userReceivingGift.auth
      && this.userReceivingGift.auth.local
      && this.userReceivingGift.auth.local.username;
      return userName;
    },
    displayName () {
      const displayName = this.userReceivingGift.profile.name;
      return displayName;
    },
  },
  watch: {
    startingPage () {
      this.selectedPage = this.startingPage;
    },
  },
  mounted () {
    this.$root.$on('habitica::send-gift', data => {
      this.userReceivingGift = data;
      this.$root.$emit('bv::show::modal', 'send-gift');
    });
    this.selectPage(this.startingPage);
  },
};
</script>
