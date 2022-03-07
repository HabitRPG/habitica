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
          class="svg-close"
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
          {{ displayName }}
      </div>
      <div
        class="d-flex flex-column mx-auto align-items-center user-name">
        @{{ userName }}
      </div>
      </div>
      <div class="">
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
              :class="{active: selectedPage === 'buyGems'}"
              @click="selectPage('buyGems')"
            >
              {{ $t('gems') }}
            </div>
          </div>
        </div>
        <!-- subscriber block -->
        <div>
          <subscription-options
            v-show="selectedPage === 'subscription'"
          />
        </div>


        <!-- gem block -->
        <div
          v-show="selectedPage === 'buyGems'"
          class=""
        >
        <!-- buy gems with money -->
          <div
          v-if="showAmountToBuy(item)"
          class="buy-gems"
          >
          </div>
          <div class="form-group">
            <label v-once>
              {{ $t('howManyGemsPurchase') }}
            </label>
            <div class="d-flex flex-column align-items-center">
            <div class="input-group">
              <div class="input-group-prepend input-group-icon align-items-center">
                <div
                  class="gem"
                  v-html="icons.gemIcon"
                ></div>
              </div>
              <input
                id="gemsForm"
                v-model="gift.gems.amount"
                class="form-control"
                type="number"
                placeholder=""
                min="0"
              >
            </div>
          </div>
          </div>
          <div>
            Total:
          </div>
          <div>
            $100.00
          </div>
            <!-- <p>{{ $t('sendGiftCost') }}</p> -->
            <div class="d-flex flex-column justify-content-center align-items-middle mt-3">
            <button
            class="btn btn-primary mx-auto mt-2"
            type="submit"
            >
            Send Gems
            </button>
            </div>
              <div
                :class="{active: selectedPage === 'ownGems'}"
                @click="selectPage('ownGems')"
                class="mx-auto mt-3 gem-state-change"
              >
              {{ $t('wantToSendOwnGems') }}
            </div>
          <payments-buttons
            :stripe-fn="() => redirectToStripe({ gemsBlock: selectedGemsBlock })"
            :paypal-fn="() => openPaypal({
              url: paypalCheckoutLink, type: 'gems', gemsBlock: selectedGemsBlock
            })"
            :amazon-data="{type: 'single', gemsBlock: selectedGemsBlock}"/>
        </div>
      </div>
        <!-- send gems from balance -->
        <div
          v-show="selectedPage === 'ownGems'"
          class="own-gems"
          >
          <div class="form-group">
            <label v-once>
              {{ $t('howManyGemsSend') }}
            </label>
          <div class="d-flex flex-column align-items-center">
            <div class="input-group">
              <div class="input-group-prepend input-group-icon align-items-center">
                <div
                  class="gem"
                  v-html="icons.gemIcon"
                ></div>
              </div>
              <input
                id="gemsForm"
                v-model="gift.gems.amount"
                class="form-control"
                type="number"
                placeholder=""
                min="0"
              >
            </div>
              <p>
                <span class="balance-text">
                  {{ $t('yourBalance') }}</span>
                <span
                    class="gem"
                    v-html="icons.gemIcon"
                    style="display: inline-block;"
                  ></span>
                <span class="balance-gems">{{ maxGems }}</span>
              </p>
            <div
              :class="{active: selectedPage === 'buyGems'}"
              @click="selectPage('buyGems')"
              class="mx-auto mt-3 gem-state-change"
            >
            {{ $t('needToPurchaseGems') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  .modal-content {
  width: 448px;
  padding: 0px 0 32px;
  border-radius: 8px;
  box-shadow: 0 14px 28px 0 rgba(26, 24, 29, 0.24), 0 10px 10px 0 rgba(26, 24, 29, 0.28);
  }


  #send-gift {
    .modal-body{
      padding: 0px;
    }

    .modal-header {
      padding-top: 0rem;
      padding-bottom: 0rem;
      border-bottom: 0;
    }

    // .subscribe-options {
    //   background-color: #F9F9F9;
    //   border-bottom: 1px solid #EDECEE;
    // }

    .modal-close {
      position: absolute;
      width: 18px;
      height: 18px;
      padding: 4px;
      right: 16px;
      top: 16px;
      cursor: pointer;

      .svg-close {
        width: 12px;
        height: 12px;
        color: #878190;
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

  .form-group {
    margin: 0 0 0 0;
    background-color: $gray-700;
    padding-bottom: 0px;
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

  .user-name {
  font-size: 0.75rem;
  line-height: 1.33;
  text-align: center;
  color: $gray-100;
  padding-bottom: 24px;
  }

  .row {
    background-color: $gray-700;
    margin: 0 0 0 0;
    minimum-height: 32px;
  }

  .nav {
    font-weight: bold;
    font-size: 0.75rem;
    minimum-height: 32px;
    text-align: center;
    padding: 16px 0 0 0;
    color: $purple-300;
    justify-content: center;
  }

  .nav-item {
    display: inline-block;
    padding: 0 20px 6px 20px;
  }

  .nav-item:hover, .nav-item.active {
    color: $purple-300;
    border-bottom: 2px solid #9a62ff;
    cursor: pointer;
  }

  label {
    color: $gray-50;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    margin-top: 0.75rem;
    margin-bottom: 0.875rem;
    width: 100%;
    text-align: center;
  }

  .input-group {
    width: 94px;
    height: 32px;
    margin: 16px 96px 24px 95px;
    padding: 0 16px 0 0;
    border-radius: 2px;
    border: solid 1px $gray-400;
    background-color: $white;
  }

  input[type="number"] {
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
    width: 34px;
    font-size: 0.75rem;
  }

  .gem {
    width: 16px;
    height: 16px;
  }

  .own-gems {
    background-color: $gray-700;
  }

  .send-gems {
    background-color: $gray-700;
  }

  .balance-text {
    font-size: 0.75rem;
    font-weight: bold;
    color: $gray-100;
    line-height: 1.33;
    // margin: 12px 8px 24px 70px;
  }

  .balance-gem-icon {
    // margin: 12px 4px 24px 8px;
    // object-fit: contain;
  }

  // .balance-gems {
  //   font-size: 0.75px;
  //   color: $gray-100;
  //   line-height: 1.33;
  //   margin: 12px 8px 24px 70px;
  // }

  .gem-state-change {
    color: $blue-10;
    font-size: 0.875rem;
    height: 24px;
    margin: 24px 48px 0;
    text-align: center;
    cursor: pointer;
    background-color: $gray-700;
  }
</style>

<script>

// libs imports
import { mapState } from '@/libs/store';

// mixins imports
import paymentsMixin from '../../mixins/payments';

// component imports
import avatar from '../avatar';
// import userLink from '../memberDetails'; // in case I need to do the tier color/icon
import subscriptionOptions from '../settings/subscriptionOptions.vue';
import paymentsButtons from '@/components/payments/buttons/list';

// svg imports
import closeIcon from '@/assets/svg/close.svg';
import gemIcon from '@/assets/svg/gem.svg';

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
        gemIcon,
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
    },
    showAmountToBuy () {
      return true;
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
    fromBal () {
      return this.gift.type === 'gems' && this.gift.gems.fromBalance;
    },
    maxGems () {
      const maxGems = this.fromBal ? this.userLoggedIn.balance * 4 : 9999;
      return maxGems;
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
