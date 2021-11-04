<template>
  <b-modal
    id="send-gems"
    :title="title"
    :hide-footer="true"
    size="md"
    @hide="onHide()"
  >
    <div v-if="userReceivingGems">
      <div
        class="panel panel-default"
        :class="gift.type === 'gems' ? 'panel-primary' : 'transparent'"
        @click="gift.type = 'gems'"
      >
        <h3 class="panel-heading clearfix">
          <div class="float-right">
            <span
              v-if="fromBal"
            >{{ $t('sendGiftGemsBalance', {number: userLoggedIn.balance * 4}) }}</span>
            <span
              v-else
            >{{ $t('sendGiftCost', {cost: gift.gems.amount / 4}) }}</span>
          </div>
          {{ $t('gems') }}
        </h3>
        <div class="panel-body">
          <div class="d-flex mb-3">
            <div class="form-group mb-0">
              <input
                v-model="gift.gems.amount"
                class="form-control"
                type="number"
                placeholder="Number of Gems"
                min="0"
                :max="fromBal ? userLoggedIn.balance * 4 : 9999"
              >
            </div>
            <div class="btn-group ml-auto">
              <button
                class="btn"
                :class="{
                  'btn-primary': fromBal,
                  'btn-secondary': !fromBal,
                }"
                @click="gift.gems.fromBalance = true"
              >
                {{ $t('sendGiftFromBalance') }}
              </button>
              <button
                class="btn"
                :class="{
                  'btn-primary': !fromBal,
                  'btn-secondary': fromBal,
                }"
                @click="gift.gems.fromBalance = false"
              >
                {{ $t('sendGiftPurchase') }}
              </button>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <p
                class="small"
                v-html="$t('gemGiftsAreOptional', assistanceEmailObject)"
              ></p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="panel panel-default"
        :class="gift.type=='subscription' ? 'panel-primary' : 'transparent'"
        @click="gift.type = 'subscription'"
      >
        <h3 class="panel-heading">
          {{ $t('subscription') }}
        </h3>
        <div class="panel-body">
          <div class="row">
            <div class="col-md-12">
              <div class="form-group mb-0">
                <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                <div
                  v-for="block in subscriptionBlocks"
                  v-if="block.target !== 'group' && block.canSubscribe === true"
                  :key="block.key"
                  class="radio"
                >
                  <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                  <label>
                    <input
                      v-model="gift.subscription.key"
                      type="radio"
                      name="subRadio"
                      :value="block.key"
                    >
                    {{ $t('sendGiftSubscription', {price: block.price, months: block.months}) }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <textarea
        v-model="gift.message"
        class="form-control"
        rows="3"
        :placeholder="$t('sendGiftMessagePlaceholder')"
        :maxlength="MAX_GIFT_MESSAGE_LENGTH"
      ></textarea>
      <span>{{ gift.message.length || 0 }} / {{ MAX_GIFT_MESSAGE_LENGTH }}</span>
      <!--include ../formatting-help-->
    </div>
    <div class="modal-footer">
      <button
        v-if="fromBal"
        class="btn btn-primary"
        :disabled="sendingInProgress"
        @click="sendGift()"
      >
        {{ $t("send") }}
      </button>
      <payments-buttons
        v-else
        :disabled="!gift.subscription.key && gift.gems.amount < 1"
        :stripe-fn="() => redirectToStripe({gift, uuid: userReceivingGems._id, receiverName})"
        :paypal-fn="() => openPaypalGift({
          gift: gift, giftedTo: userReceivingGems._id, receiverName,
        })"
        :amazon-data="{type: 'single', gift, giftedTo: userReceivingGems._id, receiverName}"
      />
    </div>
  </b-modal>
</template>

<style lang="scss">
  .panel {
    margin-bottom: 4px;

    &.transparent {
      .panel-body {
        opacity: 0.7;
      }
    }

    .panel-heading {
      margin-top: 8px;
      margin-bottom: 5px;
    }

    .panel-body {
      padding: 8px;
      border-radius: 2px;
      border: 1px solid #C3C0C7;
    }
  }
</style>

<style lang="scss" scoped>
input[type="radio"] {
  margin-right: 4px;
}
</style>

<script>
import toArray from 'lodash/toArray';
import omitBy from 'lodash/omitBy';
import orderBy from 'lodash/orderBy';
import { mapState } from '@/libs/store';
import planGemLimits from '@/../../common/script/libs/planGemLimits';
import paymentsMixin from '@/mixins/payments';
import notificationsMixin from '@/mixins/notifications';
import paymentsButtons from '@/components/payments/buttons/list';
import { MAX_GIFT_MESSAGE_LENGTH } from '@/../../common/script/constants';

// @TODO: EMAILS.TECH_ASSISTANCE_EMAIL, load from config
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  components: {
    paymentsButtons,
  },
  mixins: [paymentsMixin, notificationsMixin],
  data () {
    return {
      planGemLimits,
      gift: {
        type: 'gems',
        gems: {
          amount: 0,
          fromBalance: true,
        },
        subscription: { key: '' },
        message: '',
      },
      amazonPayments: {},
      assistanceEmailObject: {
        hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
      },
      sendingInProgress: false,
      userReceivingGems: null,
      MAX_GIFT_MESSAGE_LENGTH: MAX_GIFT_MESSAGE_LENGTH.toString(),
    };
  },
  computed: {
    ...mapState({
      userLoggedIn: 'user.data',
      originalSubscriptionBlocks: 'content.subscriptionBlocks',
    }),
    subscriptionBlocks () {
      let subscriptionBlocks = toArray(this.originalSubscriptionBlocks);
      subscriptionBlocks = omitBy(subscriptionBlocks, block => block.discount === true);
      subscriptionBlocks = orderBy(subscriptionBlocks, ['months']);

      return subscriptionBlocks;
    },
    fromBal () {
      return this.gift.type === 'gems' && this.gift.gems.fromBalance;
    },
    title () {
      if (!this.userReceivingGems) return '';
      return this.$t('sendGiftHeading', { name: this.userReceivingGems.profile.name });
    },
    receiverName () {
      if (
        this.userReceivingGems.auth
        && this.userReceivingGems.auth.local
        && this.userReceivingGems.auth.local.username
      ) {
        return this.userReceivingGems.auth.local.username;
      }
      return this.userReceivingGems.profile.name;
    },
  },
  mounted () {
    this.$root.$on('habitica::send-gems', data => {
      this.userReceivingGems = data;
      this.$root.$emit('bv::show::modal', 'send-gems');
    });
  },
  methods: {
    // @TODO move to payments mixin or action (problem is that we need notifications)
    async sendGift () {
      this.sendingInProgress = true;
      await this.$store.dispatch('members:transferGems', {
        message: this.gift.message,
        toUserId: this.userReceivingGems._id,
        gemAmount: this.gift.gems.amount,
      });
      this.close();
      setTimeout(() => { // wait for the send gem modal to be closed
        this.$root.$emit('habitica:payment-success', {
          paymentMethod: 'balance',
          paymentCompleted: true,
          paymentType: 'gift-gems-balance',
          gift: {
            gems: {
              amount: this.gift.gems.amount,
            },
          },
          giftReceiver: this.receiverName,
        });
      }, 500);
    },
    onHide () {
      // @TODO this breaks amazon purchases because when the amazon modal
      // is opened this one is closed and the amount reset
      // this.gift.gems.amount = 0;
      this.gift.message = '';
      this.sendingInProgress = false;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'send-gems');
    },
  },
};
</script>
