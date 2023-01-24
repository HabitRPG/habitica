<template>
  <b-modal
    id="birthday-modal"
    :hide-header="true"
    :hide-footer="true"
  >
    <div class="modal-content">
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="svg-icon svg-close"
          v-html="icons.close"
        >
        </div>
      </div>
      <div
        class="svg-confetti svg-icon"
        v-html="icons.confetti"
      >
      </div>
      <div>
        <img
          src="~@/assets/images/10-birthday.png"
          class="ten-birthday"
        >
      </div>
      <div class="limited-wrapper">
        <div
          class="svg-gifts svg-icon"
          v-html="icons.gifts"
        >
        </div>
        <div class="limited-event">
          {{ $t('limitedEvent') }}
        </div>
        <div class="dates">
          {{ $t('anniversaryLimitedDates') }}
        </div>
        <div
          class="svg-gifts-flip svg-icon"
          v-html="icons.gifts"
        >
        </div>
      </div>
      <div class="celebrate d-flex justify-content-center">
        {{ $t('celebrateAnniversary') }}
      </div>
      <h2 class="d-flex justify-content-center">
        <span
          class="left-divider"
          v-html="icons.divider"
        ></span>
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        {{ $t('jubilantGryphatricePromo') }}
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        <span
          class="right-divider"
        ></span>
      </h2>
      <!-- gryphatrice info -->
      <div class="d-flex">
        <div class="jubilant-gryphatrice d-flex mr-auto">
          <img
            src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet-Gryphatrice-Jubilant-Large.gif"
            width="156px"
            height="144px"
            alt="a pink, purple, and green gryphatrice pet winks at you adorably"
          >
        </div>
        <div class="align-items-center">
          <div class="limited-edition mr-auto">
            {{ $t('limitedEdition') }}
          </div>
          <div class="gryphatrice-text">
            {{ $t('anniversaryGryphatriceText') }}
          </div>
          <div
            class="gryphatrice-price"
            v-html="$t('anniversaryGryphatricePrice')"
          >
          </div>
        </div>
      </div>
      <!-- beginning of payments -->
      <!-- buy with money OR gems -->
      <div
        v-if="!ownGryphatrice && !gryphBought"
      >
        <div
          v-if="selectedPage !== 'payment-buttons'"
          id="initial-buttons"
          class="d-flex justify-content-center"
        >
          <button
            class="btn btn-secondary buy-now-left"
            :class="{active: selectedPage === 'payment-buttons'}"
            @click="selectedPage = 'payment-buttons'"
          >
            {{ $t('buyNowMoneyButton') }}
          </button>
          <button
            class="btn btn-secondary buy-now-right"
            @click="buyGryphatriceGems()"
          >
            {{ $t('buyNowGemsButton') }}
          </button>
        </div>
        <!-- buy with money -->
        <div
          v-else-if="selectedPage === 'payment-buttons'"
          id="payment-buttons"
          class="d-flex flex-column"
        >
          <button
            class="btn btn-secondary d-flex stripe"
            @click="redirectToStripe({ sku: 'price_0MPZ6iZCD0RifGXlLah2furv' })"
          >
            <span
              class="svg-stripe"
              v-html="icons.stripe"
            >
            </span>
          </button>
          <button
            class="btn btn-secondary d-flex paypal"
            @click="openPaypal({
              url: paypalCheckoutLink, type: 'sku', sku: 'Pet-Gryphatrice-Jubilant'
            })"
          >
            <span
              class="svg-paypal"
              v-html="icons.paypal"
            >
            </span>
          </button>
          <amazon-button
            :disabled="disabled"
            :amazon-data="amazonData"
            class="btn btn-secondary d-flex amazon"
            v-html="icons.amazon"
          />
          <div
            class="pay-with-gems"
            @click="selectedPage = 'initial-buttons'"
          >
            {{ $t('wantToPayWithGemsText') }}
          </div>
        </div>
      </div>
      <!-- Own the gryphatrice -->
      <div
        v-else
        class="d-flex"
      >
        <button
          class="own-gryphatrice-button"
          @click="closeAndRedirect('/inventory/stable')"
          v-html="$t('ownJubilantGryphatrice')"
        >
        </button>
      </div>
      <!-- end of payments -->
      <h2 class="d-flex justify-content-center">
        <span
          class="left-divider"
          v-html="icons.divider"
        ></span>
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        {{ $t('plentyOfPotions') }}
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        <span
          class="right-divider"
        ></span>
      </h2>
      <div class="plenty-of-potions d-flex">
        {{ $t('plentyOfPotionsText') }}
      </div>
      <div class="potions">
        <div class="pot-1">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Porcelain.png">
        </div>
        <div class="pot-2">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Vampire.png">
        </div>
        <div class="pot-3">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Aquatic.png">
        </div>
        <div class="pot-4">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_StainedGlass.png">
        </div>
        <div class="pot-5">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Celestial.png">
        </div>
        <div class="pot-6">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Glow.png">
        </div>
        <div class="pot-7">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_AutumnLeaf.png">
        </div>
        <div class="pot-8">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_SandSculpture.png">
        </div>
        <div class="pot-9">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Peppermint.png">
        </div>
        <div class="pot-10">
          <img src="https://habitica-assets.s3.amazonaws.com/mobileApp/images/Pet_HatchingPotion_Shimmer.png">
        </div>
      </div>
      <button
        class="btn btn-secondary d-flex justify-content-center visit-the-market"
        @click="closeAndRedirect('/shops/market')"
      >
        {{ $t('visitTheMarketButton') }}
      </button>
      <h2 class="d-flex justify-content-center">
        <span
          class="left-divider"
          v-html="icons.divider"
        ></span>
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        {{ $t('fourForFree') }}
        <span
          class="svg-cross"
          v-html="icons.cross"
        >
        </span>
        <span
          class="right-divider"
        ></span>
      </h2>
      <div class="four-for-free">
        {{ $t('fourForFreeText') }}
      </div>
      <div class="four-grid d-flex justify-content-center">
        <div class="day-one-a">
          <div class="day-text">
            {{ $t('dayOne') }}
          </div>
          <div class="gift d-flex justify-content-center align-items-middle">
            <img
              src="~@/assets/images/robes.webp"
              class="m-auto"
              width="40px"
              height="66px"
            >
          </div>
          <div class="description">
            {{ $t('partyRobes') }}
          </div>
        </div>
        <div class="day-one-b">
          <div class="day-text">
            {{ $t('dayOne') }}
          </div>
          <div class="gift d-flex justify-content-center align-items-middle">
            <div
              class="svg-gem svg-icon m-auto"
              v-html="icons.birthdayGems"
            >
            </div>
          </div>
          <div class="description">
            {{ $t('twentyGems') }}
          </div>
        </div>
        <div class="day-five">
          <div class="day-text">
            {{ $t('dayFive') }}
          </div>
          <div class="gift d-flex justify-content-center align-items-middle">
            <img
              src="~@/assets/images/habitica-hero-goober.webp"
              class="m-auto"
            ><!-- Birthday Set -->
          </div>
          <div class="description">
            {{ $t('birthdaySet') }}
          </div>
        </div>
        <div class="day-ten">
          <div class="day-text">
            {{ $t('dayTen') }}
          </div>
          <div class="gift d-flex justify-content-center align-items-middle">
            <div
              class="svg-background svg-icon m-auto"
              v-html="icons.birthdayBackground"
            >
            </div>
          </div>
          <div class="description">
            {{ $t('background') }}
          </div>
        </div>
      </div>
    </div>

    <div class="modal-bottom">
      <div class="limitations d-flex justify-content-center">
        {{ $t('limitations') }}
      </div>
      <div class="fine-print">
        {{ $t('anniversaryLimitations') }}
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
#birthday-modal {
  .modal-body {
    padding: 0px;
    border: 0px;
  }
  .modal-content {
    border-radius: 14px;
    border: 0px;
  }
  .modal-footer {
    border-radius: 14px;
    border: 0px;
  }
  .amazon {
    margin-bottom: 16px;

    svg {
      width: 84px;
      position: absolute;
    }

    .amazonpay-button-inner-image {
      opacity: 0;
      width: 100%;
    }
  }
}
</style>


<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

#birthday-modal {
  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.4;
    color: $white;
    column-gap: 0.5rem;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-content: center;
  }

  .modal-body{
    box-shadow: 0 14px 28px 0 rgba(26, 24, 29, 0.24), 0 10px 10px 0 rgba(26, 24, 29, 0.28);
  }

  .modal-content {
    width: 566px;
    padding: 32px 24px 24px;
    background: linear-gradient(158deg,#6133b4,#4f2a93);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .modal-bottom {
    width: 566px;
    background-color: $purple-50;
    color: $purple-500;
    line-height: 1.33;
    border-top: 0px;
    padding: 16px 40px 28px 40px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
    .limitations {
      color: $white;
      font-weight: bold;
      line-height: 1.71;
      margin-top: 8px;
      justify-content: center;
    }
    .fine-print {
      font-size: 0.75rem;
      color: $purple-500;
      line-height: 1.33;
      margin-top: 8px;
      text-align: center;
    }

  .ten-birthday {
    position: relative;
    width: 268px;
    height: 244px;
    margin: 0 125px 16px;
  }

  .limited-event {
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    justify-content: center;
    letter-spacing: 2.4px;
    margin-top: -8px;
    color: $yellow-50;
  }

  .dates {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    text-align: center;
    justify-content: center;
    color: $white;
  }

  .celebrate {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.4;
    margin: 16px 16px 24px 16px;
    text-align: center;
    color: $yellow-50;
  }

  .jubilant-gryphatrice {
    height: 176px;
    width: 204px;
    border-radius: 12px;
    background-color: $purple-50;
    align-items: center;
    justify-content: center;
    margin-right: 24px;
    margin-left: 4px;
    color: $white;
  }

  .limited-wrapper {
    margin-top: -36px;
    margin-bottom: -36px;
  }

  .limited-edition, .gryphatrice-text, .gryphatrice-price {
    max-width: 274px;
  }

  .limited-edition {
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    line-height:1.33;
    letter-spacing:2.4px;
    padding-top: 18px;
    margin-left: 24px;
    margin-bottom: 8px;
    color: $yellow-50;
  }

  .gryphatrice-text, .gryphatrice-price {
    font-size: 0.875rem;
    line-height: 1.71;
    margin-left: 24px;
    margin-right: 4px;
    color: $white;
  }

  .gryphatrice-price {
    padding-top: 16px;
    margin-left: 24px;
  }

  .buy-now-left {
    width: 243px;
    margin: 24px 8px 24px 0px;
    border-radius: 4px;
    box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
  }

  .buy-now-right {
    width: 243px;
    margin: 24px 0px 24px 8px;
    border-radius: 4px;
    box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
  }

  .stripe {
    margin-top: 24px;
    margin-bottom: 8px;
    padding-bottom: 10px;
  }

  .paypal {
    margin-bottom: 8px;
    padding-bottom: 10px;
  }

  .stripe, .paypal, .amazon {
    width: 506px;
    height: 32px;
    margin-left: 4px;
    margin-right: 4px;
    border-radius: 4px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .pay-with-gems {
    color: $white;
    text-align: center;
    margin-bottom: 24px;
    cursor: pointer;
  }

  .pay-with-gems:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .own-gryphatrice-button {
    width: 506px;
    height: 32px;
    margin: 24px 4px;
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    border: $green-100;
    background-color: $green-100;
    color: $green-1;
    cursor: pointer;
  }

  .plenty-of-potions {
    font-size: 0.875rem;
    line-height: 1.71;
    margin: 0 8px 24px;
    text-align: center;
    color: $white;
  }

  .potions {
    display: grid;
    grid-template-columns: 5;
    grid-template-rows: 2;
    gap: 24px 24px;
    justify-content: center;

    .pot-1, .pot-2, .pot-3, .pot-4, .pot-5,
    .pot-6, .pot-7, .pot-8, .pot-9, .pot-10 {
      height: 68px;
      width: 68px;
      border-radius: 8px;
      background-color: $purple-50;
    }

    .pot-1 {
      grid-column: 1 / 1;
      grid-row: 1 / 2;
    }
    .pot-2 {
      grid-column: 2 / 2;
      grid-row: 1 / 2;
    }
    .pot-3 {
      grid-column: 3 / 3;
      grid-row: 1 / 2;
    }
    .pot-4 {
      grid-column: 4 / 4;
      grid-row: 1 / 2;
    }
    .pot-5 {
      grid-column: 5 / 5;
      grid-row: 1 / 2;
    }
    .pot-6 {
      grid-column: 1 / 5;
      grid-row: 2 / 2;
    }
    .pot-7 {
      grid-column: 2 / 5;
      grid-row: 2 / 2;
    }
    .pot-8 {
      grid-column: 3 / 5;
      grid-row: 2 / 2;
    }
    .pot-9 {
      grid-column: 4 / 5;
      grid-row: 2 / 2;
    }
    .pot-10 {
      grid-column: 5 / 5;
      grid-row: 2 / 2;
    }

  }
  .visit-the-market {
    height: 32px;
    margin: 24px 4px;
    border-radius: 4px;
    box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    cursor: pointer;
  }

  .four-for-free {
    font-size: 0.875rem;
    line-height: 1.71;
    margin: 0 36px 24px;
    text-align: center;
    color: $white;
  }

  .four-grid {
    display: grid;
    grid-template-columns: 4;
    grid-template-rows: 1;
    gap: 24px;
  }
    .day-one-a, .day-one-b, .day-five, .day-ten {
      height: 140px;
      width: 100px;
      border-radius: 8px;
      background-color: $purple-50;
    }

    .day-one-a {
      grid-column: 1 / 1;
      grid-row: 1 / 1;
    }
    .day-one-b {
      grid-column: 2 / 2;
      grid-row: 1 / 1;
    }
    .day-five {
      grid-column: 3 / 3;
      grid-row: 1 / 1;
    }
    .day-ten {
      grid-column: 4 / 4;
      grid-row: 1 / 1;
    }

    .day-text {
      font-size: 0.75rem;
      font-weight: bold;
      line-height: 1.33;
      letter-spacing: 2.4px;
      text-align: center;
      text-transform: uppercase;
      padding: 4px 0px;
      color: $yellow-50;
    }

    .gift {
      height: 80px;
      width: 84px;
      margin: 0 8px 32px;
      background-color: $purple-100;
    }

    .description {
      font-size: 0.75rem;
      line-height: 1.33;
      text-align: center;
      padding: 8px 0px;
      margin-top: -32px;
      color: $white;
    }

  // SVG CSS
  .modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .svg-close {
      width: 18px;
      height: 18px;
      vertical-align: middle;
      fill: $purple-50;

        & svg path {
        fill: $purple-50 !important;;
        }
        & :hover {
        fill: $purple-50;
      }
    }
  }

  .svg-confetti {
    position: absolute;
    height: 152px;
    width: 518px;
    margin-top: 24px;
  }

  .svg-gifts, .svg-gifts-flip {
    position: relative;
    height: 32px;
    width: 85px;
  }

  .svg-gifts {
    margin-left: 70px;
    top: 30px;
  }

  .svg-gifts-flip {
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
    left: 366px;
    bottom: 34px;
  }

  .left-divider, .right-divider {
    background-image: url('~@/assets/images/fancy-divider.png');
    background-position: right center;
    background-repeat: no-repeat;
    display: inline-flex;
    flex-grow: 2;
    min-height: 1.25rem;
  }

  .right-divider {
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
  }

  .svg-cross {
    height: 12px;
    width: 12px;
    color: $yellow-50;
  }

  .svg-gem {
    height: 48px;
    width: 58px;
  }

  .svg-background {
    height: 68px;
    width: 68px;
  }

  .svg-stripe {
    height: 20px;
    width: 48px;
  }

  .svg-paypal {
    height: 16px;
    width: 60px;
  }
}

</style>


<script>
// to check if user owns JG or not
import { mapState } from '@/libs/store';

// Purchase functionality
import buy from '@/mixins/buy';
import notifications from '@/mixins/notifications';
import payments from '@/mixins/payments';
import content from '@/../../common/script/content/index';
import amazonButton from '@/components/payments/buttons/amazon';

// import images
import close from '@/assets/svg/new-close.svg';
import confetti from '@/assets/svg/confetti.svg';
import gifts from '@/assets/svg/gifts-birthday.svg';
import cross from '@/assets/svg/cross.svg';
import stripe from '@/assets/svg/stripe.svg';
import paypal from '@/assets/svg/paypal-logo.svg';
import amazon from '@/assets/svg/amazonpay.svg';
import birthdayGems from '@/assets/svg/birthday-gems.svg';
import birthdayBackground from '@/assets/svg/icon-background-birthday.svg';

export default {
  components: {
    amazonButton,
  },
  mixins: [buy, notifications, payments],
  data () {
    return {
      amazonData: {
        type: 'single',
        sku: 'Pet-Gryphatrice-Jubilant',
      },
      icons: Object.freeze({
        close,
        confetti,
        gifts,
        cross,
        stripe,
        paypal,
        amazon,
        birthdayGems,
        birthdayBackground,
      }),
      selectedPage: 'initial-buttons',
      gryphBought: false,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    ownGryphatrice () {
      return Boolean(this.user && this.user.items.pets['Gryphatrice-Jubilant']);
    },
  },
  methods: {
    hide () {
      this.$root.$emit('bv::hide::modal', 'birthday-modal');
    },
    buyGryphatriceGems () {
      const gryphatrice = content.petInfo['Gryphatrice-Jubilant'];
      if (this.user.balance * 4 < gryphatrice.value) {
        this.$root.$emit('bv::show::modal', 'buy-gems');
        return this.hide();
      }
      if (!this.confirmPurchase(gryphatrice.currency, gryphatrice.value)) {
        return null;
      }
      this.makeGenericPurchase(gryphatrice);
      this.gryphBought = true;
      return this.purchased(gryphatrice.text());
    },
    closeAndRedirect (route) {
      const routeTerminator = route.split('/')[route.split('/').length - 1];
      if (this.$router.history.current.name !== routeTerminator) {
        this.$router.push(route);
      }
      this.hide();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'birthday-modal');
    },
  },
};
</script>
