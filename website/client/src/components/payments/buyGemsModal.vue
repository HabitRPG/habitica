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
      <navbar
        :items="['subscribe', 'buyGems']"
        class="gray large split-words"
        :active="selectedPage"
        @change="selectedPage = $event"
      />
      <div v-show="selectedPage === 'buyGems'">
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
      </div>
      <div v-show="selectedPage === 'subscribe'">
        <div v-if="hasSubscription">
          <div class="row text-center">
            <h2 class="mx-auto text-leadin">
              {{ $t('subscriptionAlreadySubscribedLeadIn') }}
            </h2>
          </div>
          <div class="row text-center">
            <div class="col-10 offset-1">
              <p v-html="$t('subscriptionAlreadySubscribed1')"></p>
            </div>
          </div>
        </div>
        <div v-if="!hasSubscription">
          <div class="row text-center">
            <h2 class="mx-auto text-leadin">
              {{ $t('subscriptionBenefitLeadin') }}
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
                  <p>{{ $t('subscriptionBenefit1') }}</p>
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
                  <p>{{ $t('subscriptionBenefit2') }}</p>
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
                  <p>{{ $t('subscriptionBenefit3') }}</p>
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
                  <p>{{ $t('subscriptionBenefit4') }}</p>
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
                  <p>{{ $t('subscriptionBenefit5') }}</p>
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
                  <p>{{ $t('subscriptionBenefit6') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card-deck">
            <div
              class="card text-center"
              :class="{active: subscriptionPlan === 'basic_earned'}"
            >
              <div class="card-body">
                <div class="subscription-price">
                  <span class="superscript">$</span>
                  <span>5</span>
                  <span class="superscript muted">.00</span>
                </div>
                <div
                  v-once
                  class="small"
                >
                  {{ $t('everyMonth') }}
                </div>
                <div class="divider"></div>
                <p
                  v-markdown="$t('earnGemsMonthly', {cap:25})"
                  class="benefits"
                ></p>
                <div class="spacer"></div>
                <button
                  class="btn btn-primary"
                  @click="subscriptionPlan = 'basic_earned'"
                >
                  {{ subscriptionPlan === "basic_earned" ? $t('selected') : $t('select') }}
                </button>
              </div>
            </div>
            <div
              class="card text-center"
              :class="{active: subscriptionPlan === 'basic_3mo'}"
            >
              <div class="card-body">
                <div class="subscription-price">
                  <span class="superscript">$</span>
                  <span>15</span>
                  <span class="superscript muted">.00</span>
                </div>
                <div
                  v-once
                  class="small"
                >
                  {{ $t('everyXMonths', {interval: 3}) }}
                </div>
                <div class="divider"></div>
                <p
                  v-markdown="$t('earnGemsMonthly', {cap:30})"
                  class="benefits"
                ></p>
                <p
                  v-markdown="$t('receiveMysticHourglass')"
                  class="benefits"
                ></p>
                <button
                  class="btn btn-primary"
                  @click="subscriptionPlan = 'basic_3mo'"
                >
                  {{ subscriptionPlan === "basic_3mo" ? $t('selected') : $t('select') }}
                </button>
              </div>
            </div>
            <div
              class="card text-center"
              :class="{active: subscriptionPlan === 'basic_6mo'}"
            >
              <div class="card-body">
                <div class="subscription-price">
                  <span class="superscript">$</span>
                  <span>30</span>
                  <span class="superscript muted">.00</span>
                </div>
                <div
                  v-once
                  class="small"
                >
                  {{ $t('everyXMonths', {interval: 6}) }}
                </div>
                <div class="divider"></div>
                <p
                  v-markdown="$t('earnGemsMonthly', {cap:35})"
                  class="benefits"
                ></p>
                <p
                  v-markdown="$t('receiveMysticHourglasses', {amount:2})"
                  class="benefits"
                ></p>
                <button
                  class="btn btn-primary"
                  @click="subscriptionPlan = 'basic_6mo'"
                >
                  {{ subscriptionPlan === "basic_6mo" ? $t('selected') : $t('select') }}
                </button>
              </div>
            </div>
            <div
              class="card text-center"
              :class="{active: subscriptionPlan === 'basic_12mo'}"
            >
              <div class="card-body">
                <div class="subscription-price">
                  <span class="superscript">$</span>
                  <span>48</span>
                  <span class="superscript muted">.00</span>
                </div>
                <div
                  v-once
                  class="small"
                >
                  {{ $t('everyYear') }}
                </div>
                <div class="divider"></div>
                <p
                  v-markdown="$t('earnGemsMonthly', {cap:45})"
                  class="benefits"
                ></p>
                <p
                  v-markdown="$t('receiveMysticHourglasses', {amount:4})"
                  class="benefits"
                ></p>
                <button
                  class="btn btn-primary"
                  @click="subscriptionPlan = 'basic_12mo'"
                >
                  {{ subscriptionPlan === "basic_12mo" ? $t('selected') : $t('select') }}
                </button>
              </div>
            </div>
          </div>
          <div
            v-if="subscriptionPlan"
            class="row text-center"
          >
            <h2
              v-once
              class="mx-auto text-payment"
            >
              {{ $t('choosePaymentMethod') }}
            </h2>
          </div>
          <div class="row text-center">
            <a
              v-once
              class="mx-auto"
            >{{ $t('haveCouponCode') }}</a>
          </div>
          <div
            v-if="subscriptionPlan"
            class="payments-column"
          >
            <button
              class="purchase btn btn-primary payment-button payment-item"
              @click="showStripe({subscription: subscriptionPlan})"
            >
              <div
                class="svg-icon credit-card-icon"
                v-html="icons.creditCardIcon"
              ></div>
              {{ $t('card') }}
            </button>
            <button
              class="btn payment-item paypal-checkout payment-button"
              @click="openPaypal(paypalSubscriptionLink, 'subscription')"
            >
              &nbsp;
              <img
                src="~@/assets/images/paypal-checkout.png"
                :alt="$t('paypal')"
              >&nbsp;
            </button>
            <amazon-button
              class="payment-item"
              :amazon-data="{type: 'subscription', subscription: subscriptionPlan}"
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
              {{ $t('subscribeSupportsDevs') }}
            </div>
          </div>
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

  .benefits {
    font-size: 14px;
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

  .muted {
    color: #c3c0c7;
  }

  .spacer {
    height: 4em;
  }

  .subscription-price {
    font-family: Roboto Condensed;
    font-size: 48px;
    font-weight: bold;
    color: #1ca372;
  }

  .superscript {
    font-size: 24px;
    vertical-align: super;
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
import Navbar from '@/components/ui/simpleNavbar';

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
    Navbar,
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
    startingPageOption () {
      return this.$store.state.gemModalOptions.startingPage;
    },
    hasSubscription () {
      return Boolean(this.user.purchased.plan.customerId);
    },
    userReachedGemCap () {
      return this.user.purchased.plan.customerId
        && this.user.purchased.plan.gemsBought
        >= (this.user.purchased.plan.consecutive.gemCapExtra + this.planGemLimits.convCap);
    },
  },
  watch: {
    startingPageOption () {
      this.selectedPage = this.$store.state.gemModalOptions.startingPage;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'buy-gems');
    },
  },
};
</script>
