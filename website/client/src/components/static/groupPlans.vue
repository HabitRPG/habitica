<template>
  <div class="group-plan-static text-center">
    <amazon-payments-modal />
    <div class="container">
      <div class="row top">
        <div class="top-left"></div>
        <div class="col-6 offset-3">
          <img
            class="party"
            src="../../assets/images/group-plans-static/party@3x.png"
          >
          <h1>{{ $t('groupPlanTitle') }}</h1>
          <p>{{ $t('groupPlanDesc') }}</p>
          <div class="pricing">
            <span>Just</span>
            <span class="number">$9</span>
            <span class="bold">per month +</span>
            <span class="number">$3</span>
            <span class="bold">per member*</span>
          </div>
          <div class="text-center">
            <button
              class="btn btn-primary cta-button"
              @click="goToNewGroupPage()"
            >
              {{ $t('getStarted') }}
            </button>
          </div>
          <small>{{ $t('billedMonthly') }}</small>
        </div>
        <div class="top-right"></div>
      </div>
      <div class="row">
        <div class="text-col col-12 col-md-6 text-left">
          <h2>{{ $t('teamBasedTasksList') }}</h2>
          <p>{{ $t('teamBasedTasksListDesc') }}</p>
        </div>
        <div class="col-12 col-md-6">
          <div
            class="team-based"
            v-html="svg.teamBased"
          ></div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-6">
          <div
            class="group-management"
            v-html="svg.groupManagement"
          ></div>
        </div>
        <div class="text-col col-12 col-md-6 text-left">
          <h2>{{ $t('groupManagementControls') }}</h2>
          <p>{{ $t('groupManagementControlsDesc') }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-6 offset-md-3 text-center">
          <img
            class="big-gem"
            src="../../assets/images/group-plans-static/big-gem@3x.png"
          >
          <h2>{{ $t('inGameBenefits') }}</h2>
          <p>{{ $t('inGameBenefitsDesc') }}</p>
        </div>
      </div>
      <div class="row">
        <div class="bot-left"></div>
        <div class="col-6 offset-3">
          <h2 class="purple">
            {{ $t('inspireYourParty') }}
          </h2>
          <div class="pricing">
            <span>Just</span>
            <span class="number">$9</span>
            <span class="bold">per month +</span>
            <span class="number">$3</span>
            <span class="bold">per member*</span>
          </div>
          <div class="text-center">
            <button
              class="btn btn-primary cta-button"
              @click="goToNewGroupPage()"
            >
              {{ $t('getStarted') }}
            </button>
          </div>
          <small>{{ $t('billedMonthly') }}</small>
        </div>
        <div class="bot-right"></div>
      </div>
    </div>
    <b-modal
      id="group-plan"
      title
      size="md"
      :hide-footer="true"
      :hide-header="true"
    >
      <div v-if="modalPage === 'account'">
        <h2>{{ $t('letsMakeAccount') }}</h2>
        <auth-form @authenticate="authenticate()" />
      </div>
      <div v-if="modalPage === 'purchaseGroup'">
        <create-group-modal-pages />
      </div>
    </b-modal>
  </div>
</template>

<style lang='scss' scoped>
  @import url('https://fonts.googleapis.com/css?family=Varela+Round');

  h1, h2 {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
  }

  .party {
    width: 386px;
    margin-top: 4em;
  }

  .team-based {
    background-image: url('../../assets/images/group-plans-static/group-management@3x.png');
    background-size: contain;
    position: absolute;
    height: 356px;
    width: 411px;
    margin-top: -2em;
  }

  .group-management {
    background-image: url('../../assets/images/group-plans-static/team-based@3x.png');
    background-size: contain;
    position: absolute;
    height: 294px;
    width: 411px;
  }

  .top-left, .top-right, .bot-left, .bot-right {
    width: 273px;
    height: 396px;
    background-size: contain;
    position: absolute;
  }

  .top-left {
    background-image: url('../../assets/images/group-plans-static/top-left@3x.png');
    left: 4em;
    height: 420px;
  }

  .top-right {
    background-image: url('../../assets/images/group-plans-static/top-right@3x.png');
    right: 4em;
    height: 420px;
  }

  .bot-left {
    background-image: url('../../assets/images/group-plans-static/bot-left@3x.png');
    left: 4em;
    bottom: 1em;
  }

  .bot-right {
    background-image: url('../../assets/images/group-plans-static/bot-right@3x.png');
    right: 4em;
    bottom: 1em;
  }

  h1 {
    font-size: 42px;
    color: #34313a;
    line-height: 1.17;
  }

  h2 {
    font-size: 29px;
    color: #34313a;
    margin-top: 1em;
  }

  .purple {
    color: #6133b4;
  }

  p {
    font-size: 20px;
    color: #878190;
  }

  .group-plan-static {
    margin-top: 6em;
    position: relative;
  }

  .row {
    margin-top: 10em;
    margin-bottom: 10em;
  }

  .text-col {
    margin-top: 3em;
  }

  .big-gem {
    width: 138.5px;
  }

  .cta-button {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
    padding: 1em 2em;
    margin-top: 1em;
    margin-bottom: 1em;
    border-radius: 4px;
    background-color: #6133b4;
    box-shadow: inset 0 -4px 0 0 rgba(52, 49, 58, 0.4);
    font-size: 20px;
    color: #fff;
  }

  .pricing {
    color: #878190;
    font-size: 24px;

    span {
      margin-right: .2em;
    }

    .bold {
      font-weight: bold;
    }

    .number {
      color: #1ca372;
      font-weight: bold;
    }
  }

  small {
    font-size: 16px;
    color: #a5a1ac;
  }
</style>

<script>
import { setup as setupPayments } from '@/libs/payments';
import amazonPaymentsModal from '@/components/payments/amazonModal';
import AuthForm from '../auth/authForm.vue';
import CreateGroupModalPages from '../group-plans/createGroupModalPages.vue';

import party from '../../assets/images/group-plans-static/party.svg';

export default {
  components: {
    AuthForm,
    CreateGroupModalPages,
    amazonPaymentsModal,
  },
  data () {
    return {
      svg: {
        party,
      },
      modalTitle: this.$t('register'),
      modalPage: 'account',
    };
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
    goToNewGroupPage () {
      this.$root.$emit('bv::show::modal', 'group-plan');
    },
    authenticate () {
      this.modalPage = 'purchaseGroup';
    },
  },
};
</script>
