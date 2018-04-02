<template lang="pug">
b-modal#group-plan-overview(title="Empty", size='lg', hide-footer=true, @shown='shown()')
  .header-wrap.text-center(slot="modal-header")
    h2(v-once) Getting Started
    p(v-once) Congratulations on creating your new Group! Here are a few answers to some of the more commonly asked questions.
  .row
    .col-12
      .card(:class='{expanded: expandedQuestions.question1}')
        .question-head
          .q Q.
          .title What's included in the subscription
          .arrow.float-right(@click='toggle("question1")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question1')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question1')
          p All members of the Group receive full subscription benefits, including the monthly subscriber items, the ability to buy Gems with Gold, and the Royal Purple Jackalope mount, which is exclusive to users with a Group Plan membership.
    .col-12
      .card(:class='{expanded: expandedQuestions.question2}')
        .question-head
          .q Q.
          .title How does billing work?
          .arrow.float-right(@click='toggle("question2")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question2')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question2')
          p Group Leaders are billed based on group member count on a monthly basis. This charge includes the $9 (USD) price for the Group Leader subscription, plus $3 USD for each additional group member. For example: A group of four users will cost $18 USD/month, as the group consists of 1 Group Leader + 3 group members.
    .col-12
      .card(:class='{expanded: expandedQuestions.question3}')
        .question-head
          .q Q.
          .title How do you assign a Task?
          .arrow.float-right(@click='toggle("question3")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question3')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question3')
          p Assign any Task to one or more Group members (including the Group Leader or Managers themselves) by entering their usernames in the "Assign To" field within the Create Task modal. You can also decide to assign a Task after creating it, by editing the Task and adding the user in the "Assign To" field!
          .assign-tasks.image-example
    .col-12
      .card(:class='{expanded: expandedQuestions.question4}')
        .question-head
          .q Q.
          .title How do you mark a Task as requiring approval?
          .arrow.float-right(@click='toggle("question4")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question4')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question4')
          p Toggle the "Requires Approval" setting to mark a specific task as requiring Group Leader or Manager confirmation. The user who checked off the task won't get their rewards for completing it until it has been approved.
          .requires-approval.image-example
          p Group Leaders and Managers can approve completed Tasks directly from the Task Board or from the Notifications panel.
          .approval-requested.image-example
    .col-12
      .card(:class='{expanded: expandedQuestions.question5}')
        .question-head
          .q Q.
          .title What is a Group Manager?
          .arrow.float-right(@click='toggle("question5")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question5')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question5')
          p A Group Manager is a user role that do not have access to the group's billing details, but can create, assign, and approve shared Tasks for the Group's members. Promote Group Managers from the Group’s member list.
          .promote-leader.image-example
    .col-12.text-center
      button.btn.btn-primary.close-button(@click='close()') Go to Task Board
</template>

<style>
  #group-plan-overview___BV_modal_header_ {
    border-bottom: none;
  }
</style>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Varela+Round');

  .header-wrap {
    padding-left: 4em;
    padding-right: 4em;

    h2 {
      font-size: 32px;
      font-weight: bold;
      margin-top: 1em;
    }

    p {
      color: #878190;
      font-size: 16px;
    }
  }

  .row {
    margin-bottom: 2em;

    .col-12 {
      margin-bottom: .5em;
    }
  }

  .card.expanded {
    padding-bottom: 1em;

    .title {
      color: #4f2a93;
    }
  }

  .card {
    min-height: 60px;
    border-radius: 4px;
    background-color: #ffffff;
    border: none;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);

    .question-head {
      .q {
        font-family: 'Varela Round', sans-serif;
        font-size: 20px;
        color: #a5a1ac;
        margin: 1em;
      }

      .title {
        font-weight: normal;
      }

      div {
        display: inline-block;
      }

      .arrow {
        margin: 1em;
        padding-top: .9em;

        .svg-icon {
          width: 26px;
          height: 16px;
        }
      }

      .arrow:hover {
        cursor: pointer;
      }
    }

    .question-body {
      padding-left: 4.4em;
      padding-right: 4em;

      p {
        color: #4e4a57;
      }
    }
  }

  .image-example {
    background-repeat: no-repeat;
    margin: 0 auto;
    background-position: center;
    background-size: contain;
  }

  .assign-tasks {
    background-image: url('~assets/images/group-plans/assign-task@3x.png');
    width: 400px;
    height: 150px;
  }

  .requires-approval {
    background-image: url('~assets/images/group-plans/requires-approval@3x.png');
    width: 402px;
    height: 20px;
    margin-bottom: 1em;
  }

  .approval-requested {
    background-image: url('~assets/images/group-plans/approval-requested@3x.png');
    width: 471px;
    height: 204px;
  }

  .promote-leader {
    background-image: url('~assets/images/group-plans/promote-leader@3x.png');
    width: 423px;
    height: 185px;
  }

  .close-button {
    margin-top: 1em;
  }
</style>

<script>
import * as Analytics from 'client/libs/analytics';
import { mapState } from 'client/libs/store';

import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        upIcon,
        downIcon,
      }),
      expandedQuestions: {
        question1: false,
        question2: false,
        question3: false,
        question4: false,
        question5: false,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    shown () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'viewed-group-plan-overview',
      });
    },
    toggle (question) {
      this.expandedQuestions[question] = !this.expandedQuestions[question];
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'group-plan-overview');
    },
  },
};
</script>
