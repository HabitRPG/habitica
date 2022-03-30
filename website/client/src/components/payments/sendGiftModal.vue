<template>
  <b-modal
    id="send-gift"
    :hide-footer="true"
    :hide-header="true"
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
          class="icon-close"
          v-html="icons.closeIcon"
        >
        </div>
      </div>
      <div>
        <h2 class="d-flex flex-column mx-auto align-items-center">
          {{ $t('sendAGift') }}
        </h2>
      </div>
      <!-- user avatar -->
      <div
        v-if="userReceivingGift"
        class="modal-body"
      >
        <avatar
          :member="userReceivingGift"
          :hideClassBadge="true"
          class="d-flex flex-column mx-auto align-items-center"
        />
        <div class="avatar-spacer"></div>
        <div
          class="d-flex flex-column mx-auto align-items-center display-name">
          <!-- user display name and username -->
            <user-link
              :user-id="userName"
              :name="displayName"
              :backer="userBacker"
              :contributor="userContributor"
              :class="display-name"
              />
        </div>
        <div
          class="d-flex flex-column mx-auto align-items-center user-name">
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

            <!-- need to figure out how to make this bit disable .active for 'subscription'-->
          <div
            class="nav-item"
            :class="{active: selectedPage !== 'subscription'}"
            @click="selectPage('buyGems')"
          >
            {{ $t('gems') }}
          </div>
        </div>
      </div>
      <!-- subscriber block -->
      <!-- <div class="subscribe-option"> -->
          <subscription-options
            v-show="selectedPage === 'subscription'"
            class="subscribe-option"
          />
      <!-- </div> -->


      <!-- gem block -->
      <div
        v-show="selectedPage === 'buyGems'"
      >
      <div class="gem-group">


      <!-- buy gems with money -->
        <label v-once>
          {{ $t('howManyGemsPurchase') }}
        </label>

        <div class="d-flex flex-row align-items-center justify-content-center">
          <!-- @keypress.enter not working here while it does work attached to the icon?
          & @tabindex will need to be added below -->
          <div
            class="gray-circle"
            @click="gift.gems.amount--"
            @keyup.native="preventNegative($event)"
            >
            <div
              class="icon-negative"
              v-html="icons.negativeIcon"
              ></div>
          </div>
          <div class="input-group">
            <div class="input-group-prepend input-group-icon align-items-center">
              <div
                class="icon-gem"
                v-html="icons.gemIcon"
              ></div>
            </div>
            <input
              id="gemsForm"
              v-model.number="gift.gems.amount"
              class="form-control"
              placeholder="0"
              min="1"
              max="9999"
            >
          </div>
          <!-- @tabindex will need to be added below -->
          <div
            class="gray-circle"
            @click="gift.gems.amount++"
            >
            <div
              class="icon-positive"
              v-html="icons.positiveIcon"
              ></div>
          </div>
          </div>
          <!-- the word "total" -->
          <div class="buy-gem-total">
            {{ $t('sendGiftTotal') }}
          </div>
          <!-- the actual dollar amount -->
          <div class="buy-gem-amount">
            <span>
              {{ $t('sendGiftAmount', {cost: formatter.format(gift.gems.amount * 0.25)}) }}
            </span>
        </div>
        <div
          :class="{active: selectedPage === 'ownGems'}"
          @click="selectPage('ownGems')"
          class="gem-state-change"
        >
          {{ $t('wantToSendOwnGems') }}
        </div>
      </div>
        <payments-buttons
          :stripe-fn="() => redirectToStripe({ gemsBlock: selectedGemsBlock })"
          :paypal-fn="() => openPaypal({
            url: paypalCheckoutLink, type: 'gems', gemsBlock: selectedGemsBlock
          })"
          :amazon-data="{type: 'single', gemsBlock: selectedGemsBlock}"
          class="payment-buttons"
          />
    </div>


        <!-- send gems from balance -->
      <div
        v-show="selectedPage === 'ownGems'"
        >
        <div class="gem-group">
        <label v-once>
          {{ $t('howManyGemsSend') }}
        </label>
        <div class="d-flex align-items-center justify-content-center">
          <!-- @keypress.enter not working here while it does work attached to the icon?
          & @tabindex will need to be added below -->
          <div
            class="gray-circle"
            @click="gift.gems.amount--"
            @keyup.native="preventNegative($event)"
            >
            <div
              class="icon-negative"
              v-html="icons.negativeIcon"
              ></div>
          </div>
        <div class="input-group">
          <div class="input-group-prepend input-group-icon align-items-center">
            <div
              class="icon-gem"
              v-html="icons.gemIcon"
            ></div>
          </div>
            <input
              id="gemsForm"
              v-model="gift.gems.amount"
              class="form-control"
              placeholder="0"
              min="0"
              :max="maxGems"
            >
        </div>
        <!-- @tabindex will need to be added below -->
          <div
            class="gray-circle"
            @click="gift.gems.amount++"
            >
            <div
              class="icon-positive"
              v-html="icons.positiveIcon"
              ></div>
          </div>
        </div>
          <div class="align-items-middle">
            <div class="d-flex justify-content-center align-items-middle">
              <span class="balance-text">
                {{ $t('yourBalance') }}</span>
              <span
                  class="icon-gem balance-gem-margin"
                  v-html="icons.gemIcon"
                  style="display: inline-block;"
                ></span>
              <span
                class="balance-gems">
                {{ maxGems }}
              </span>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-center align-items-middle mt-3">
            <button
            v-if="fromBal"
            class="btn btn-primary mx-auto mt-2"
            type="submit"
            :disabled="sendingInProgress"
            @click="sendGift()"
            >
              {{ $t("send") }}
            </button>
          </div>
          <div
          :class="{active: selectedPage === 'buyGems'}"
          @click="selectPage('buyGems')"
          class="gem-state-change"
          >
          {{ $t('needToPurchaseGems') }}
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';
  #send-gift {
    .modal-dialog {
      max-width: 448px;
    }

    .modal-content {
      width: 448px;
      // padding: 0px 0 32px;
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 rgba(26, 24, 29, 0.24), 0 10px 10px 0 rgba(26, 24, 29, 0.28);
    }
    .modal-body{
      padding: 0px;
    }

    .modal-close {
      position: absolute;
      width: 18px;
      height: 18px;
      padding: 4px;
      right: 16px;
      top: 16px;
      cursor: pointer;

      .icon-close {
        width: 15px;
        height: 15px;

        & ::v-deep svg path {
          fill: #878190;
        }
      }

  }
}
</style>
<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-300;
    padding-top: 2rem;
  }

  .avatar-spacer {
    height: 9px;
  }

  .display-name {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    margin: 0px 6px 0 20px;
  }

  .display-name a:hover{
    text-decoration: none;
  }

  .user-name {
    font-size: 0.75rem;
    line-height: 1.33;
    text-align: center;
    color: $gray-100;
    padding-bottom: 16px;
  }

  .row {
    background-color: $gray-700;
    margin: 0 0 0 0;
    min-height: 32px;
  }

  .nav {
    font-weight: bold;
    font-size: 0.75rem;
    min-height: 32px;
    padding: 16px 0 0 0;
    color: $purple-300;
    justify-content: center;
  }

  .nav-item {
    display: inline-block;
    padding: 0px 8px 6px 8px;
  }

  .nav-item:hover, .nav-item.active {
    color: $purple-300;
    border-bottom: 2px solid #9a62ff;
    cursor: pointer;
  }

  .nav-item.inactive {
    color: $purple-300;
    border-bottom: 0px;
    cursor: pointer;
  }

  .gem-group {
    padding: 0 0 24px 0;
    background-color: $gray-700;
    margin: 0 0 0 0;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px
  }

  label {
    color: $gray-50;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    margin: 12px 0 16px 0;
    width: 100%;
    text-align: center;
  }

  .input-group {
    width: 94px;
    height: 32px;
    margin: 0px 16px 0px 16px;
    padding: 0;
    border-radius: 2px;
    border: solid 1px $gray-400;
    background-color: $white;
  }

  .gray-circle {
    border-radius: 100%;
    border: solid 2px $gray-300;
    width: 32px;
    height: 32px;
    cursor: pointer;

    &:hover,
    &:focus-within {
      border-color: $purple-400;
    }
  }

  .icon-gem {
    width: 16px;
    height: 16px;
  }

  .icon-positive:hover, .icon-negative:hover {
    &:focus-within,
    & ::v-deep svg path {
      fill: $purple-400;
    }
  }

  .icon-positive, .icon-negative {
    width: 10px;
    height: 10px;
    margin: 4px auto;

    & ::v-deep svg path {
      fill: $gray-300;
    }
  }

  .buy-gem-total {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    padding-top: 24px;
    text-align: center;
    height: 28px;
  }

  .buy-gem-amount {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.4;
    margin: 16px 0 24px 0;
    text-align: center;
    height: 28px;
    color: $green-10;
  }

  .balance-text {
    font-size: 0.75rem;
    font-weight: bold;
    color: $gray-100;
    line-height: 1.33;
    margin: 12px 0px 0px 70px;
  }

  .balance-gem-margin {
    margin: 8px 4px 0px 8px;
    // object-fit: contain;
  }

  .balance-gems {
    font-size: 0.75rem;
    color: $gray-100;
    line-height: 1.33;
    margin: 12px 71px 0px 4px;
  }

  .gem-state-change {
    color: $blue-10;
    font-size: 0.875rem;
    min-height: 24px;
    margin: 16px 0 0;
    text-align: center;
    cursor: pointer;
  }

  .subscribe-option {
    background: $gray-700;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    padding-bottom: 24px;
  }

  .subscription-options {
    background: $gray-700;
  }

  .payment-buttons {
    padding: 24px 0;
  }

</style>

<script>

// libs imports
import { mapState } from '@/libs/store';

// mixins imports
import paymentsMixin from '../../mixins/payments';

// component imports
import avatar from '../avatar';
import userLink from '../userLink'; // in case I need to do the tier color/icon
import subscriptionOptions from '../settings/subscriptionOptions.vue';
import paymentsButtons from '@/components/payments/buttons/list';

// svg imports
import closeIcon from '@/assets/svg/close.svg';
import gemIcon from '@/assets/svg/gem.svg';
import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';

export default {
  components: {
    avatar,
    subscriptionOptions,
    paymentsButtons,
    userLink,
  },
  mixins: [
    paymentsMixin,
  ],
  data () {
    return {
      subscription: {
        key: '',
      },
      icons: Object.freeze({
        closeIcon,
        gemIcon,
        positiveIcon,
        negativeIcon,
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
      sendingInProgress: false,
      userReceivingGems: null,
      amazonPayments: {},
      gemCost: 1,
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
    },
    // we'll need this later
    // onHide () {
    //   this.gift.message = '';
    //   this.sendingInProgress = false;
    // },
  },
  computed: {
    ...mapState({
      userLoggedIn: 'user.data',
    }),
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
    userBacker () {
      const userBacker = this.userReceivingGift.backer;
      return userBacker;
    },
    userContributor () {
      const userContributor = this.userReceivingGift.contributor;
      return userContributor;
    },
    tierIcon () {
      if (this.isNPC) {
        return this.icons.tierNPC;
      }
      return this.icons[`tier${this.level}`];
    },
    fromBal () {
      return this.gift.type === 'gems' && this.gift.gems.fromBalance;
    },
    maxGems () {
      const maxGems = this.fromBal ? this.userLoggedIn.balance * 4 : 9999;
      return maxGems;
    },
    formatter () {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
      return formatter;
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
