<template lang="pug">
  .group-plan-static.text-center
    .container
      .row.top
        .col-6.offset-3
          img.party(src='../../assets/images/group-plans-static/party@3x.png')
          h1 Need more for your party?
          p This should be a two or three sentence blurb about the team-focused aspect of Group Plans and how their enhanced task management enables productivity with your friends/co-workers.
          .pricing
            span Just
            span.number $9
            span.bold per month +
            span.number $3
            span.bold per member*
          .text-center
            button.btn.btn-primary.cta-button(@click="goToNewGroupPage()") {{ $t('getStarted') }}
          small *billed as a monthly subscription
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
        .col-6.offset-3
          h2 Need more for your party?
          .pricing
            span Just
            span.number $9
            span.bold per month +
            span.number $3
            span.bold per member*
          .text-center
            button.btn.btn-primary.cta-button(@click="goToNewGroupPage()") {{ $t('getStarted') }}
          small *billed as a monthly subscription
</template>

<style lang='scss' scoped>  
  .party {
    width: 386px;
    margin-top: 4em;
  }

  h1 {
    font-size: 48px;
    color: #34313a;
  }

  h2 {
    font-size: 32px;
    color: #34313a;
  }

  p {
    font-size: 20px;
    color: #878190;
  }

  .group-plan-static {
    margin-top: 6em;
  }

  .row {
    margin-top: 4em;
    margin-bottom: 4em;
  }

  .text-col {
    margin-top: 3em;
  }

  .big-gem {
    width: 138.5px;
  }

  .cta-button {
    margin-top: 1em;
    margin-bottom: 1em;
    border-radius: 4px;
    background-color: #6133b4;
    box-shadow: inset 0 -4px 0 0 rgba(52, 49, 58, 0.4);
    font-size: 20px;
    color: #fff;
    /* font-family: VarelaRound; */
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
    }
  }

  small {
    font-size: 16px;
    color: #a5a1ac;
  }
</style>

<style>
  .team-based svg {
    height: 292px;
  }

  .group-management svg {
    height: 224px;
  }
</style>

<script>
  import StaticHeader from './header.vue';
  import * as Analytics from 'client/libs/analytics';

  import party from '../../assets/images/group-plans-static/party.svg';
  import groupManagement from '../../assets/images/group-plans-static/group-management.svg';
  import teamBased from '../../assets/images/group-plans-static/team-based.svg';

  export default {
    components: {
      StaticHeader,
    },
    data () {
      return {
        enterprisePlansEmailSubject: 'Question regarding Enterprise Plans',
        svg: {
          party,
          groupManagement,
          teamBased,
        },
      };
    },
    methods: {
      goToNewGroupPage () {
        if (!this.$store.state.isUserLoggedIn) {
          this.$router.push({
            name: 'register',
            query: {
              redirectTo: '/group-plans',
            },
          });
          return;
        }

        this.$router.push('/group-plans');
      },
      contactUs () {
        Analytics.track({
          hitType: 'event',
          eventCategory: 'button',
          eventAction: 'click',
          eventLabel: 'Contact Us (Plans)',
        });

        window.location.href = `mailto:vicky@habitica.com?subject=${ this.enterprisePlansEmailSubject }`;
      },
    },
  };
</script>
