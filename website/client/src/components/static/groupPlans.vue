<template>
  <div>
    <group-plan-creation-modal />
    <div class="d-flex justify-content-center">
      <div
        class="group-plan-page text-center"
        :class="{ static: isStaticPage }"
      >
        <div class="top-left"></div>
        <div class="col-6 offset-3 mb-100">
          <img
            class="party"
            src="../../assets/images/group-plans-static/party@3x.png"
          >
          <h1 class="mt-5" v-if="upgradingGroup._id">{{ $t('upgradeYourCrew') }}</h1>
          <h1 class="mt-5" v-else>{{ $t('groupPlanTitle') }}</h1>
          <p class="mb-0">{{ $t('groupPlanDesc') }}</p>
          <div class="pricing mt-5">
            <span>Just</span>
            <span class="number">$9</span>
            <span class="bold">per month +</span>
            <span class="number">$3</span>
            <span class="bold">per additional member*</span>
          </div>
          <div class="text-center">
            <button
              class="btn btn-primary cta-button white mt-4 mb-3"
              @click="goToNewGroupPage()"
            >
              {{ $t('getStarted') }}
            </button>
          </div>
          <p class="gray-200">{{ $t('billedMonthly') }}</p>
        </div>
        <div class="top-right"></div>
        <div class="d-flex justify-content-between align-items-middle w-100 gap-72 mb-100">
          <div class="ml-auto my-auto w-448 text-left">
            <h2 class="mt-0">{{ $t('teamBasedTasksList') }}</h2>
            <p>{{ $t('teamBasedTasksListDesc') }}</p>
          </div>
          <div class="mr-auto my-auto">
            <img src="../../assets/images/group-plans-static/group-management@3x.png">
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-middle w-100 gap-72 mb-100">
          <div class="ml-auto my-auto">
            <img src="../../assets/images/group-plans-static/team-based@3x.png">
          </div>
          <div class="mr-auto my-auto w-448 text-left">
            <h2 class="mt-0">{{ $t('groupManagementControls') }}</h2>
            <p>{{ $t('groupManagementControlsDesc') }}</p>
          </div>
        </div>
        <div class="d-flex flex-column justify-content-center">
          <img
            class="big-gem mb-3 mx-auto"
            src="../../assets/images/group-plans-static/big-gem@3x.png"
          >
          <h2 class="mt-3">{{ $t('inGameBenefits') }}</h2>
          <p class="final-paragraph mx-auto">{{ $t('inGameBenefitsDesc') }}</p>
        </div>
        <div class="text-center mb-128">
          <div class="bot-left"></div>
          <div class="col-6 offset-3">
            <h2 class="purple-300 mt-0 mb-4" v-if="upgradingGroup._id">
              {{ $t('readyToUpgrade') }}
            </h2>
            <h2 v-else class="purple-300 mt-0 mb-4">
              {{ $t('createGroupToday') }}
            </h2>
            <div class="pricing mb-4">
              <span>Just</span>
              <span class="number">$9</span>
              <span class="bold">per month +</span>
              <span class="number">$3</span>
              <span class="bold">per member*</span>
            </div>
            <div class="text-center mb-3">
              <button
                class="btn btn-primary cta-button white"
                @click="goToNewGroupPage()"
              >
                {{ $t('getStarted') }}
              </button>
            </div>
            <p class="gray-200">{{ $t('billedMonthly') }}</p>
          </div>
          <div class="bot-right"></div>
        </div>
        <b-modal
          id="group-plan"
          title
          size="md"
          :hide-footer="true"
          :hide-header="true"
        >
          <div>
            <h2>{{ $t('letsMakeAccount') }}</h2>
            <auth-form @authenticate="authenticate()" />
          </div>
        </b-modal>
      </div>
    </div>
    <div
      class="bottom-banner text-center"
      :class="{ static: isStaticPage }"
    >
      <h2 class="white">{{ $t('interestedLearningMore') }}</h2>
      <p class="purple-600" v-html="$t('checkGroupPlanFAQ')"></p>
    </div>
  </div>
</template>

<style lang='scss'>
  .bottom-banner > .purple-600 {
    color: #D5C8FF !important;

    a {
      color: #D5C8FF;
      text-decoration: underline;
    }
  }
</style>

<style lang='scss' scoped>
  @import url('https://fonts.googleapis.com/css?family=Varela+Round');
  @import '~@/assets/scss/colors.scss';

  // General typography tweaks

  h1, h2 {
    font-family: 'Varela Round', sans-serif;
    font-weight: 400;
  }

  h1 {
    color: $purple-300;
    font-size: 48px;
    line-height: 56px;
  }

  h2 {
    color: $gray-50;
    font-size: 32px;
    line-height: 40px;
  }

  p {
    color: $gray-100;
    font-size: 20px;
    line-height: 28px;
  }

  // Major layout elements

  .bottom-banner {
    height: 152px;
    background-image: linear-gradient(rgba(97, 51, 180), rgba(79, 42, 147));
    padding-top: 32px;
    width: 100vw;

    &.static {
      padding-top: 16px;
    }

    &:not(.static) {
      margin-left: -12px;
    }
  }

  .cta-button {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
    padding: 1em 2em;
    border-radius: 8px;
    background-color: $purple-300;
    box-shadow: inset 0 -4px 0 0 rgba(52, 49, 58, 0.4);
    font-size: 20px;
    line-height: 28px;

    &.btn-primary:hover {
      background-color: $purple-400;
    }
  }

  .final-paragraph {
    width: 684px;
    margin-bottom: 11rem;
  }

  .group-plan-page {
    max-width: 1440px;
    position: relative;

    &.static {
      margin-top: 56px;
    }
  }

  .pricing {
    color: $gray-100;
    font-size: 24px;

    span {
      margin-right: .2em;
    }

    .bold {
      font-weight: bold;
    }

    .number {
      color: $green-10;
      font-weight: bold;
    }
  }

  // One-off spacing adjustments

  .gap-72 {
    gap: 72px;
  }

  .mb-100 {
    margin-bottom: 100px !important;
  }

  .mb-128 {
    margin-bottom: 128px !important;
  }

  .w-448 {
    width: 448px;
  }

  // Images

  .big-gem {
    width: 138.5px;
  }

  .bot-left, .bot-right, .top-left, .top-right  {
    width: 246px;
    height: 340px;
    background-size: contain;
    position: absolute;
    background-repeat: no-repeat;
  }

  .bot-left {
    background-image: url('../../assets/images/group-plans-static/bot-left@3x.png');
    left: 48px;
    bottom: 48px;
  }

  .bot-right {
    background-image: url('../../assets/images/group-plans-static/bot-right@3x.png');
    right: 48px;
    bottom: 48px;
  }

  .party {
    width: 386px;
    margin-top: 100px;
  }

  .top-left {
    background-image: url('../../assets/images/group-plans-static/top-left@3x.png');
    top: 48px;
    left: 48px;
  }

  .top-right {
    background-image: url('../../assets/images/group-plans-static/top-right@3x.png');
    right: 48px;
    top: 48px;
  }
</style>

<script>
import { setup as setupPayments } from '@/libs/payments';
import paymentsMixin from '../../mixins/payments';
import AuthForm from '../auth/authForm.vue';
import GroupPlanCreationModal from '../group-plans/groupPlanCreationModal.vue';

export default {
  components: {
    AuthForm,
    GroupPlanCreationModal,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      modalOption: '',
      modalPage: 'account',
      modalTitle: this.$t('register'),
    };
  },
  computed: {
    isStaticPage () {
      return this.$route.meta.requiresLogin === false;
    },
    upgradingGroup () {
      return this.$store.state.upgradingGroup;
    },
    user () {
      return this.$store.state.user?.data;
    },
  },
  mounted () {
    this.$nextTick(() => {
      // Load external scripts after the app has been rendered
      setupPayments();
    });
    this.$store.dispatch('common:setTitle', {
      section: this.$t('groupPlans'),
    });
  },
  methods: {
    authenticate () {
      this.$root.$emit('bv::hide::modal', 'group-plan');
      this.$root.$emit('bv::show::modal', 'create-group');
    },
    goToNewGroupPage () {
      if (this.isStaticPage && !this.user) {
        this.modalOption = 'static';
        return this.$root.$emit('bv::show::modal', 'group-plan');
      }
      if (this.upgradingGroup._id) {
        return this.stripeGroup({ group: this.upgradingGroup, upgrade: true });
      }
      return this.$root.$emit('bv::show::modal', 'create-group');
    },
  },
};
</script>
