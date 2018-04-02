<template lang="pug">
  .group-plan-static.text-center
    amazon-payments-modal
    .container
      .row.top
        .top-left
        .col-6.offset-3
          img.party(src='../../assets/images/group-plans-static/party@3x.png')
          h1 Need more for your crew?
          p Managing a small team or organizing household chores? Our group plans grant you exclusive access to a private task board and chat area dedicated to you and your group members!
          .pricing
            span Just
            span.number $9
            span.bold per month +
            span.number $3
            span.bold per member*
          .text-center
            button.btn.btn-primary.cta-button(@click="goToNewGroupPage()") {{ $t('getStarted') }}
          small *billed as a monthly subscription
        .top-right
      .row
        .text-col.col-12.col-md-6.text-left
          h2 Team-Based Task List
          p Set up an easily-viewed shared task list for the group. Assign tasks to your fellow group members, or let them claim their own tasks to make it clear what everyone is working on!
        .col-12.col-md-6
          .team-based(v-html='svg.teamBased')
      .row
        .col-12.col-md-6
          .group-management(v-html='svg.groupManagement')
        .text-col.col-12.col-md-6.text-left
          h2 Group Management Controls
          p Use task approvals to verify that a task that was really completed, add Group Managers to share responsibilities, and enjoy a private group chat for all team members.
      .row
        .col-12.col-md-6.offset-md-3.text-center
          img.big-gem(src='../../assets/images/group-plans-static/big-gem@3x.png')
          h2 In-Game Benefits
          p Group members get an exclusive Jackalope Mount, as well as full subscription benefits, including special monthly equipment sets and the ability to buy gems with gold.
      .row
        .bot-left
        .col-6.offset-3
          h2.purple Inspire your party, gamify life together.
          .pricing
            span Just
            span.number $9
            span.bold per month +
            span.number $3
            span.bold per member*
          .text-center
            button.btn.btn-primary.cta-button(@click="goToNewGroupPage()") {{ $t('getStarted') }}
          small *billed as a monthly subscription
        .bot-right
    b-modal#group-plan(title="", size='md', :hide-footer='true', :hide-header='true')
      div(v-if='modalPage === "account"')
        h2 First, let’s make you an account
        auth-form(@authenticate='authenticate()')
      div(v-if='modalPage === "purchaseGroup"')
        h2 Next, Name Your Group
        create-group-modal-pages
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
  import { setup as setupPayments } from 'client/libs/payments';
  import amazonPaymentsModal from 'client/components/payments/amazonModal';
  import StaticHeader from './header.vue';
  import AuthForm from '../auth/authForm.vue';
  import CreateGroupModalPages from '../group-plans/createGroupModalPages.vue';

  import party from '../../assets/images/group-plans-static/party.svg';

  export default {
    components: {
      StaticHeader,
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
