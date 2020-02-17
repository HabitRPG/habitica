<template>
  <div v-if="user">
    <b-modal
      id="buy-gems"
      :hide-footer="true"
      size="lg"
    >
      <div
        slot="modal-header"
        class="header-wrap"
      >
        <div class="image-gemfall">
          <div class="row">
            <h2 class="header-invert mx-auto">
              {{ $t('support') }}
            </h2>
          </div>
          <div class="row">
            <div
              class="logo svg-icon mx-auto"
              v-html="icons.logo"
            ></div>
          </div>
        </div>
      </div>
      <div v-if="hasSubscription">
        <div class="row text-center">
          <h2 class="mx-auto text-leadin">
            {{ $t('subscriptionAlreadySubscribedLeadIn') }}
          </h2>
        </div>
        <div class="row text-center">
          <div class="col-6 offset-3">
            <p>{{ $t("gemsPurchaseNote") }}</p>
          </div>
        </div>
      </div>
      <div class="row text-center">
        <h2 class="mx-auto text-leadin">
          {{ $t('gemBenefitLeadin') }}
        </h2>
      </div>
      <div class="row">
        <div class="col">
          <div class="row">
            <div class="col-md-2 offset-1">
              <div class="d-flex bubble justify-content-center align-items-center">
                <div
                  class="svg-icon check mx-auto"
                  v-html="icons.check"
                ></div>
              </div>
            </div>
            <div class="col-md-8 align-self-center">
              <p>{{ $t('gemBenefit1') }}</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2 offset-1">
              <div class="d-flex bubble justify-content-center align-items-center">
                <div
                  class="svg-icon check mx-auto"
                  v-html="icons.check"
                ></div>
              </div>
            </div>
            <div class="col-md-8 align-self-center">
              <p>{{ $t('gemBenefit2') }}</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col-md-2 offset-1">
              <div class="d-flex bubble justify-content-center align-items-center">
                <div
                  class="svg-icon check mx-auto"
                  v-html="icons.check"
                ></div>
              </div>
            </div>
            <div class="col-md-8 align-self-center">
              <p>{{ $t('gemBenefit3') }}</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2 offset-1">
              <div class="d-flex bubble justify-content-center align-items-center">
                <div
                  class="svg-icon check mx-auto"
                  v-html="icons.check"
                ></div>
              </div>
            </div>
            <div class="col-md-8 align-self-center">
              <p>{{ $t('gemBenefit4') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="card-deck gem-deck">
        <div
          class="card text-center col-3"
          :class="{active: gemAmount === 20 }"
        >
          <div class="card-img-top">
            <div
              class="mx-auto"
              style="'height: 55px; width: 47.5px; margin-top: 1.85em;'"
              v-html="icons.twentyOneGems"
            ></div>
          </div>
          <div class="card-body">
            <div class="gem-count">
              20
            </div>
            <div class="gem-text">
              {{ $t('gems') }}
            </div>
            <div class="divider"></div>
            <button
              class="btn btn-primary"
              @click="gemAmount === 20 ? gemAmount = 0 : gemAmount = 20"
            >
              {{ gemAmount === 20 ? $t('selected') : '$5.00' }}
            </button>
          </div>
        </div>
      </div>
      <div class="row text-center">
        <h2 class="mx-auto text-payment">
          {{ $t('choosePaymentMethod') }}
        </h2>
      </div>
      <div class="payments-column">
        <button
          class="purchase btn btn-primary payment-button payment-item"
          @click="showStripe({})"
        >
          <div
            class="svg-icon credit-card-icon"
            v-html="icons.creditCardIcon"
          ></div>
          {{ $t('card') }}
        </button>
        <button
          class="btn payment-item paypal-checkout payment-button"
          @click="openPaypal(paypalCheckoutLink, 'gems')"
        >
          &nbsp;
          <img
            src="~@/assets/images/paypal-checkout.png"
            :alt="$t('paypal')"
          >&nbsp;
        </button>
        <amazon-button
          class="payment-item"
          :amazon-data="{type: 'single'}"
        />
      </div>
      <div class="row text-center">
        <div
          class="svg-icon mx-auto"
          style="'height: 24px; width: 24px;'"
          v-html="icons.heart"
        ></div>
      </div>
      <div class="row text-center text-outtro">
        <div class="col-6 offset-3">
          {{ $t('buyGemsSupportsDevs') }}
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang="scss">
  #buy-gems .modal-body {
    padding: 0;
  }

  #buy-gems .modal-content {
    border-radius: 8px;
    width: 824px;
  }

  #buy-gems .modal-header {
    padding: 0;
    border-bottom: 0px;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';


  .payments-column {
    margin: 0 auto;
  }

  a.mx-auto {
    color: #2995cd;
  }

  button {
    margin-bottom: 1em;
  }

  p {
    font-size: 16px;
  }

  .bubble {
    width: 32px;
    height: 32px;
    border-radius: 1000px;
    border: solid 2px #e1e0e3;
  }

  .gem-deck {
    align-items: center;
    justify-content: center;
  }

  .divider {
    width: 80%;
    height: 1px;
    background-color: #e1e0e3;
    margin: 1em auto;
  }

  .gem-count {
    font-family: Roboto;
    font-size: 40px;
    font-weight: bold;
    color: #2995cd;
  }

  .gem-text {
    font-family: Roboto;
    font-size: 16px;
    color: #a5a1ac;
    margin-bottom: 1em;
  }

  .image-gemfall {
    background: url(~@/assets/images/gemfall.png) center repeat-y;
    height: 14em;
  }

  .header-wrap {
    background-image: linear-gradient(74deg, #4f2a93, #6133b4);
    height: 14em;
    width: 100%;
    color: #4e4a57;
    padding: 0;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }

  .logo {
    width: 256px;
    height: 56px;
  }

  .svg-icon.check {
    color: #bda8ff;
    width: 1rem;
  }

  .header-invert {
    margin: 3rem auto 1.5rem;
    color: #FFFFFF;
    font-family: Roboto;
    font-weight: normal;
    letter-spacing: 0.18em;
  }

  .text-leadin {
    margin: 1rem;
    font-weight: bold;
    color: $purple-200;
  }

  .text-outtro {
    margin-bottom: 1em;
    color: #a5a1ac;
  }

  .text-payment {
    color: #4e4a57;
    font-size: 24px;
    margin: 1em;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import markdown from '@/directives/markdown';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import paymentsMixin from '@/mixins/payments';

import checkIcon from '@/assets/svg/check.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import heart from '@/assets/svg/health.svg';
import logo from '@/assets/svg/habitica-logo.svg';

import fourGems from '@/assets/svg/4-gems.svg';
import twentyOneGems from '@/assets/svg/21-gems.svg';
import fortyTwoGems from '@/assets/svg/42-gems.svg';
import eightyFourGems from '@/assets/svg/84-gems.svg';

import amazonButton from '@/components/payments/amazonButton';

export default {
  components: {
    amazonButton,
  },
  directives: {
    markdown,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      icons: Object.freeze({
        logo,
        check: checkIcon,
        creditCardIcon,
        fourGems,
        heart,
        twentyOneGems,
        fortyTwoGems,
        eightyFourGems,
      }),
      gemAmount: 0,
      subscriptionPlan: '',
      selectedPage: 'subscribe',
      planGemLimits,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    hasSubscription () {
      return Boolean(this.user.purchased.plan.customerId);
    },
    userReachedGemCap () {
      return this.user.purchased.plan.customerId
        && this.user.purchased.plan.gemsBought
        >= (this.user.purchased.plan.consecutive.gemCapExtra + this.planGemLimits.convCap);
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'buy-gems');
    },
  },
};
</script>
