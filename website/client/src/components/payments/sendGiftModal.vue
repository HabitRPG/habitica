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
          class="svg-icon"
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
        <div class="vertical-space"></div>
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
        >
        <!-- buy gems with money -->
          <div
          v-if="showAmountToBuy(item)"
          class=""
          >
          </div>
          <div class="form-group">
            <label
              v-once
              class="mb-1"
            >{{ $t('howManyGemsPurchase') }}</label>
            <div class="input-group">
              <div class="input-group-prepend input-group-icon align-items-center">
                <div
                  class="svg-icon gem"
                  v-html="icons.gemIcon"
                ></div>
              </div>
              <input
                v-model="maxGems"
                class="form-control"
                type="number"
                required="required"
                placeholder="16"
                min="0"
              >
            </div>
          </div>
          <div>
            <!-- <p>{{ $t('sendGiftCost') }}</p> -->
              <div
              :class="{active: selectedPage === 'ownGems'}"
              @click="selectPage('ownGems')"
              class="mx-auto mt-3 blue-10"
              >
              {{ $t('wantToSendOwnGems') }}
            </div>
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
        class="standard-page">

        <div class="purchase-amount">
          <h3 class="how-many-to-buy">{{ $t ('howManyGemsSend') }}</h3>
            <div
            :class="{active: selectedPage === 'buyGems'}"
            @click="selectPage('buyGems')"
            class="mx-auto mt-3 blue-10"
            >
            {{ $t('needToPurchaseGems') }}
            </div>
            <p>
              Max Gems: {{ maxGems }} [placeholder for maxGems function data]
            </p>
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
        color: #878190;
      }

      .subscribe-option {
        background-color: #F9F9F9;
      }
  }
}
</style>
<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: #6133B4;
  }

  label {
    color: $purple-300;
    font-size: 1.25rem;
  }

  .gray-10 {
    color: $gray-10;
  }

  .gray-50 {
    color: $gray-50;
  }

  .gray-400 {
    color: $gray-400;
  }

  .gray-600 {
    color: $gray-600;
  }

  .green-10 {
    color: $green-10;
  }

  .blue-10 {
    color: $blue-10;
  }

  .header-mini {
    font-size: 12px;
    font-weight: bold;
  }

  .vertical-space {
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
  color: #686274;
  }

  .nav {
    font-weight: bold;
    font-size: 0.75rem;
    minimum-height: 32px;
    text-align: center;
    padding: 8px 0 0;
    color:#6133B4;
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

  .background-fill {
    background-color: #F9F9F9;
  }

  .subscribe-option {
    border-bottom: 1px solid #EDECEE;
  }

  .purchase-amount {
    margin-top: 24px;
  }

  // .input-group {
  //   width: 34px;
  //   height: 24px;
  //   margin: 4px 0 4px 12px;
  //   // font-size: 14px;
  //   // line-height: 1.71;
  //   color: #4E4A57;
  //   // display: inline-block;
  // }

  // .input-group-prepend {
  //   width: 100px;
  //   height: 16px;
  //   margin: 16px 82px 12px 81px;
  //   padding: 8px;
  //   border-radius: 2px;
  //   background-color: #EDECEE;
  //   display: inline-block;
  // }
  .svg-icon {

  }

  .gem {
    width: 16px;
    height: 16px;
  }
</style>

<script>

// libs imports
import { mapState } from '@/libs/store';

// mixins imports
import paymentsMixin from '../../mixins/payments';

// component imports
import avatar from '../avatar';
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
