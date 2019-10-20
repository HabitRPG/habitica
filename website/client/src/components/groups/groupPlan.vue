<template>
  <!-- @TODO: Move to group plans folder-->
  <div>
    <div>
      <div class="header">
        <h1 class="text-center">
          Need more for your Group?
        </h1>
        <div class="row">
          <div class="col-8 offset-2 text-center">
            <h2 class="sub-text">
              {{ $t('groupBenefitsDescription') }}
            </h2>
          </div>
        </div>
      </div>
      <div class="container benefits">
        <div class="row">
          <div class="col-4">
            <div class="box">
              <img
                class="box1"
                src="~@/assets/images/group-plans/group-14@3x.png"
              >
              <hr>
              <h2>{{ $t('teamBasedTasks') }}</h2>
              <p>Set up an easily-viewed shared task list for the group. Assign tasks to your fellow group members, or let them claim their own tasks to make it clear what everyone is working on!</p><!-- eslint-disable-line max-len -->
            </div>
          </div>
          <div class="col-4">
            <div class="box">
              <img
                class="box2"
                src="~@/assets/images/group-plans/group-12@3x.png"
              >
              <hr>
              <h2>Group Management Controls</h2>
              <p>Use task approvals to verify that a task that was really completed, add Group Managers to share responsibilities, and enjoy a private group chat for all team members.</p><!-- eslint-disable-line max-len -->
            </div>
          </div>
          <div class="col-4">
            <div class="box">
              <img
                class="box3"
                src="~@/assets/images/group-plans/group-13@3x.png"
              >
              <hr>
              <h2>In-Game Benefits</h2>
              <p>Group members get an exclusive Jackalope Mount, as well as full subscription benefits, including special monthly equipment sets and the ability to buy gems with gold.</p><!-- eslint-disable-line max-len -->
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="upgradingGroup._id"
        id="upgrading-group"
        class="container payment-options"
      >
        <h1 class="text-center purple-header">
          Are you ready to upgrade?
        </h1>
        <div class="row">
          <div class="col-12 text-center">
            <div class="purple-box">
              <div class="amount-section">
                <div class="dollar">
                  $
                </div>
                <div class="number">
                  9
                </div>
                <div class="name">
                  Group Owner Subscription
                </div>
              </div>
              <div class="plus">
                <div
                  class="svg-icon"
                  v-html="icons.positiveIcon"
                ></div>
              </div>
              <div class="amount-section">
                <div class="dollar">
                  $
                </div>
                <div class="number">
                  3
                </div>
                <div class="name">
                  Each Individual Group Member
                </div>
              </div>
            </div>
            <div class="box payment-providers">
              <h3>Choose your payment method</h3>
              <div class="payments-column">
                <button
                  class="purchase btn btn-primary payment-button payment-item"
                  @click="pay(PAYMENTS.STRIPE)"
                >
                  <div
                    class="svg-icon credit-card-icon"
                    v-html="icons.creditCardIcon"
                  ></div>
                  {{ $t('card') }}
                </button>
                <amazon-button
                  class="payment-item"
                  :amazon-data="pay(PAYMENTS.AMAZON)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!upgradingGroup._id"
        class="container col-6 offset-3 create-option"
      >
        <div class="row">
          <h1 class="col-12 text-center purple-header">
            Create your Group today!
          </h1>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <button
              class="btn btn-primary create-group"
              @click="launchModal('create')"
            >
              Create Your New Group
            </button>
          </div>
        </div>
        <div class="row pricing">
          <div class="col-5">
            <div class="dollar">
              $
            </div>
            <div class="number">
              9
            </div>
            <div class="name">
              <div>Group Owner</div>
              <div>Subscription</div>
            </div>
          </div>
          <div class="col-1">
            <div class="plus">
              +
            </div>
          </div>
          <div class="col-6">
            <div class="dollar">
              $
            </div>
            <div class="number">
              3
            </div>
            <div class="name">
              <div>Each Additional</div>
              <div>Member</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      id="group-plan-modal"
      title="Select Payment"
      size="md"
      hide-footer="hide-footer"
    >
      <div
        v-if="activePage === PAGES.CREATE_GROUP"
        class="col-12"
      >
        <div class="form-group">
          <label
            class="control-label"
            for="new-group-name"
          >Name</label>
          <input
            id="new-group-name"
            v-model="newGroup.name"
            class="form-control input-medium option-content"
            required="required"
            type="text"
            placeholder="Name"
          >
        </div>
        <div class="form-group">
          <label for="new-group-description">{{ $t('description') }}</label>
          <textarea
            id="new-group-description"
            v-model="newGroup.description"
            class="form-control option-content"
            cols="3"
            :placeholder="$t('description')"
          ></textarea>
        </div>
        <div
          v-if="type === 'guild'"
          class="form-group"
        >
          <div class="custom-control custom-radio">
            <input
              v-model="newGroup.privacy"
              class="custom-control-input"
              type="radio"
              name="new-group-privacy"
              value="private"
            >
            <label class="custom-control-label">{{ $t('inviteOnly') }}</label>
          </div>
        </div>
        <div class="form-group">
          <div class="custom-control custom-checkbox">
            <input
              id="create-group-leaderOnlyChallenges-checkbox"
              v-model="newGroup.leaderOnly.challenges"
              class="custom-control-input"
              type="checkbox"
            >
            <label
              class="custom-control-label"
              for="create-group-leaderOnlyChallenges-checkbox"
            >{{ $t('leaderOnlyChallenges') }}</label>
          </div>
        </div>
        <div
          v-if="type === 'party'"
          class="form-group"
        >
          <button
            class="btn btn-secondary form-control"
            :value="$t('createGroupPlan')"
            @click="createGroup()"
          ></button>
        </div>
        <div class="form-group">
          <button
            class="btn btn-primary btn-lg btn-block"
            :disabled="!newGroupIsReady"
            @click="createGroup()"
          >
            {{ $t('createGroupPlan') }}
          </button>
        </div>
      </div>
      <div
        v-if="activePage === PAGES.PAY"
        class="col-12"
      >
        <div class="text-center">
          <h3>Choose your payment method</h3>
          <div class="payments-column mx-auto">
            <button
              class="purchase btn btn-primary payment-button payment-item"
              @click="pay(PAYMENTS.STRIPE)"
            >
              <div
                class="svg-icon credit-card-icon"
                v-html="icons.creditCardIcon"
              ></div>
              {{ $t('card') }}
            </button>
            <amazon-button
              class="payment-item"
              :amazon-data="pay(PAYMENTS.AMAZON)"
            />
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang="scss" scoped>
  #upgrading-group {
    .amount-section {
      position: relative;
    }

    .dollar {
      position: absolute;
      left: -1em;
      top: 1em;
    }

    .purple-box {
      color: #bda8ff;
      margin-bottom: 2em;
    }

    .number {
      font-weight: bold;
      color: #fff;
    }

    .plus .svg-icon{
      width: 24px;
    }

    .payment-providers {
      width: 350px;
    }
  }

  .header {
    background: #432874;
    background: linear-gradient(180deg, #4F2A93 0%, #432874 100%);
    color: #fff;
    padding: 2em;
    height: 340px;
    margin-bottom: 2em;
    margin-left: -12px;
    margin-right: -12px;

    h1 {
      font-size: 48px;
      line-height: 1.16;
      margin-top: 12px;
      color: #fff;
    }

    h2.sub-text {
      color: #D5C8FF;
      font-size: 24px;
      font-weight: 400;
      line-height: 1.33;
    }
  }

  .benefits {
    margin-top: -10em;

    .box {
      height: 416px;
    }

    h2 {
      color: #6133b4;
    }
  }

  .box {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 2em;
    text-align: center;
    display: inline-block !important;
    vertical-align: bottom;
    margin-right: 1em;

    img {
      margin: 0 auto;
      margin-top: 2em;
      margin-bottom: 1em;
    }
  }

  img.box1 {
    width: 266px;
  }

  img.box2 {
    margin-top: 3.5em;
    width: 262px;
    margin-bottom: 3.7em;
  }

  img.box3 {
    width: 225px;
    margin-bottom: 3.0em;
  }

  button.create-group {
    width: 330px;
    height: 96px;
  }

  .purple-header {
    color: #6133b4;
    font-size: 48px;
    margin-top: 1em;
  }

  .pricing {
    margin-top: 2em;
    margin-bottom: 4em;

    .dollar, .number, .name {
      display: inline-block;
      vertical-align: bottom;
      color: #a5a1ac;
    }

    .plus {
      font-size: 34px;
      color: #a5a1ac;
    }

    .dollar {
      margin-bottom: 1.5em;
      font-size: 32px;
      font-weight: bold;
    }

    .name {
      font-size: 24px;
      margin-bottom: .8em;
      margin-left: .5em;
    }

    .number {
      font-size: 72px;
      font-weight: bolder;
    }
  }

  .payment-options {
    margin-bottom: 4em;

    .purple-box {
      background-color: #4f2a93;
      color: #fff;
      padding: .5em;
      border-radius: 8px;
      width: 200px;
      height: 215px;

      .dollar {
      }

      .number {
        font-size: 60px;
      }

      .name {
        width: 100px;
        margin-left: .3em;
      }

      .plus {
        width: 100%;
        text-align: center;
      }

      div {
        display: inline-block;
      }
    }

    .box, .purple-box {
      display: inline-block;
      vertical-align: bottom;
    }
  }
</style>

<script>
import paymentsMixin from '../../mixins/payments';
import { mapState } from '@/libs/store';
import positiveIcon from '@/assets/svg/positive.svg';
import creditCardIcon from '@/assets/svg/credit-card-icon.svg';
import amazonButton from '@/components/payments/amazonButton';

export default {
  components: {
    amazonButton,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
        creditCardIcon,
        positiveIcon,
      }),
      PAGES: {
        CREATE_GROUP: 'create-group',
        UPGRADE_GROUP: 'upgrade-group',
        PAY: 'pay',
      },
      PAYMENTS: {
        AMAZON: 'amazon',
        STRIPE: 'stripe',
      },
      paymentMethod: '',
      newGroup: {
        type: 'guild',
        privacy: 'private',
        name: '',
        leaderOnly: {
          challenges: false,
        },
      },
      activePage: '',
      type: 'guild', // Guild or Party @TODO enum this
    };
  },
  computed: {
    newGroupIsReady () {
      return Boolean(this.newGroup.name);
    },
    upgradingGroup () {
      return this.$store.state.upgradingGroup;
    },
    // @TODO: can we move this to payment mixin?
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.activePage = this.PAGES.BENEFITS;
  },
  methods: {
    launchModal () {
      this.changePage(this.PAGES.CREATE_GROUP);
      this.$root.$emit('bv::show::modal', 'group-plan-modal');
    },
    changePage (page) {
      this.activePage = page;
      window.scrollTo(0, 0);
    },
    createGroup () {
      this.changePage(this.PAGES.PAY);
    },
    pay (paymentMethod) {
      const subscriptionKey = 'group_monthly'; // @TODO: Get from content API?
      const paymentData = {
        subscription: subscriptionKey,
        coupon: null,
      };

      if (this.upgradingGroup && this.upgradingGroup._id) {
        paymentData.groupId = this.upgradingGroup._id;
        paymentData.group = this.upgradingGroup;
      } else {
        paymentData.groupToCreate = this.newGroup;
      }

      this.paymentMethod = paymentMethod;

      if (this.paymentMethod === this.PAYMENTS.AMAZON) {
        paymentData.type = 'subscription';
        return paymentData;
      }

      if (this.paymentMethod === this.PAYMENTS.STRIPE) {
        this.showStripe(paymentData);
      }

      return null;
    },
  },
};
</script>
