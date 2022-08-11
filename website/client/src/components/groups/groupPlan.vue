<template>
  <!-- @TODO: Move to group plans folder-->
  <div>
    <group-plan-creation-modal />
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
      <!-- Upgrading an existing group -->
      <div
        v-if="upgradingGroup._id"
        id="upgrading-group"
        class="container payment-options"
      >
        <h1 class="text-center purple-header">
          Are you ready to upgrade?
        </h1>
        <div class="row">
          <div class="col-12 text-center mb-4 d-flex justify-content-center">
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
              <payments-buttons
                :stripe-fn="() => pay(PAYMENTS.STRIPE)"
                :amazon-data="pay(PAYMENTS.AMAZON)"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Create a new group -->
      <div
        v-if="!upgradingGroup._id"
        class="container col-6 offset-3 create-option"
      >
        <div class="row">
          <h1 class="col-12 text-center purple-header">
            Create Your Group Today!
          </h1>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <button
              class="btn btn-primary create-group"
              @click="launchModal('create-page')"
            >
              Create Your New Group!
            </button>
          </div>
        </div>
        <div class="row pricing justify-content-center align-items-center">
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
          <div class="plus">
            +
          </div>
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
</template>

<style lang="scss" scoped>
  #upgrading-group {
    .amount-section {
      position: relative;
    }

    .dollar {
      position: absolute;
      left: -16px;
      top: 16px;
    }

    .purple-box {
      color: #bda8ff;
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
    padding: 32px;
    height: 340px;
    margin-bottom: 32px;
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
      border-radius: 8px;
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
    border-radius: 8px;
    font-size: 1.5rem;
  }

  .purple-header {
    color: #6133b4;
    font-size: 48px;
    margin-top: 16px;
  }

  .pricing {
    margin-top: 32px;
    margin-bottom: 64px;

    .dollar, .number, .name {
      display: inline-block;
      vertical-align: bottom;
      color: #a5a1ac;
    }

    .plus {
      font-size: 2.125rem;
      color: #a5a1ac;
      margin-left: 16px;
      margin-right: 16px;
    }

    .dollar {
      margin-bottom: 24px;
      font-size: 2rem;
      font-weight: bold;
    }

    .name {
      font-size: 1.5rem;
      margin-left: 8px;
      margin-right: 8px;
    }

    .number {
      font-size: 4.5rem;
      font-weight: bolder;
    }
  }

  .payment-options {
    margin-bottom: 64px;

    .purple-box {
      background-color: #4f2a93;
      color: #fff;
      padding: 8px;
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
        margin-left: 4.8px;
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
import paymentsButtons from '@/components/payments/buttons/list';
import groupPlanCreationModal from '../group-plans/groupPlanCreationModal';

export default {
  components: {
    paymentsButtons,
    groupPlanCreationModal,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      amazonPayments: {},
      icons: Object.freeze({
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
    this.$store.dispatch('common:setTitle', {
      section: this.$t('groupPlans'),
    });
  },
  methods: {
    launchModal () {
      console.log('i am creating a group');
      // this.changePage(this.PAGES.CREATE_GROUP);
      this.$root.$emit('bv::show::modal', 'create-group');
    },
    // changePage (page) {
    //   this.activePage = 'page';
    //   window.scrollTo(0, 0);
    // },
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
        this.redirectToStripe(paymentData);
      }

      return null;
    },
  },
};
</script>
