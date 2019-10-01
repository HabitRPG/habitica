<template lang="pug">
b-modal#group-plan-overview(title="Empty", size='lg', hide-footer=true, @shown='shown()')
  .header-wrap.text-center(slot="modal-header")
    h2(v-once) {{ $t('gettingStarted') }}
    p(v-once) {{ $t('congratsOnGroupPlan') }}
  .row
    .col-12
      .card(:class='{expanded: expandedQuestions.question1}')
        .question-head
          .q Q.
          .title {{ $t('whatsIncludedGroup') }}
          .arrow.float-right(@click='toggle("question1")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question1')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question1')
          p {{ $t('whatsIncludedGroupDesc') }}
    .col-12
      .card(:class='{expanded: expandedQuestions.question2}')
        .question-head
          .q Q.
          .title {{ $t('howDoesBillingWork') }}
          .arrow.float-right(@click='toggle("question2")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question2')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question2')
          p {{ $t('howDoesBillingWorkDesc') }}
    .col-12
      .card(:class='{expanded: expandedQuestions.question3}')
        .question-head
          .q Q.
          .title {{ $t('howToAssignTask') }}
          .arrow.float-right(@click='toggle("question3")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question3')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question3')
          p {{ $t('howToAssignTaskDesc') }}
          .assign-tasks.image-example
    .col-12
      .card(:class='{expanded: expandedQuestions.question4}')
        .question-head
          .q Q.
          .title {{ $t('howToRequireApproval') }}
          .arrow.float-right(@click='toggle("question4")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question4')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question4')
          p {{ $t('howToRequireApprovalDesc') }}
          .requires-approval.image-example
          p {{ $t('howToRequireApprovalDesc2') }}
          .approval-requested.image-example
    .col-12
      .card(:class='{expanded: expandedQuestions.question5}')
        .question-head
          .q Q.
          .title {{ $t('whatIsGroupManager') }}
          .arrow.float-right(@click='toggle("question5")')
            .svg-icon(v-html="icons.upIcon", v-if='expandedQuestions.question5')
            .svg-icon(v-html="icons.downIcon", v-else)
        .question-body(v-if='expandedQuestions.question5')
          p {{ $t('whatIsGroupManagerDesc') }}
          .promote-leader.image-example
    .col-12.text-center
      button.btn.btn-primary.close-button(@click='close()') {{ $t('goToTaskBoard') }}
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
    background-image: url('~@/assets/images/group-plans/assign-task@3x.png');
    width: 400px;
    height: 150px;
  }

  .requires-approval {
    background-image: url('~@/assets/images/group-plans/requires-approval@3x.png');
    width: 402px;
    height: 20px;
    margin-bottom: 1em;
  }

  .approval-requested {
    background-image: url('~@/assets/images/group-plans/approval-requested@3x.png');
    width: 471px;
    height: 204px;
  }

  .promote-leader {
    background-image: url('~@/assets/images/group-plans/promote-leader@3x.png');
    width: 423px;
    height: 185px;
  }

  .close-button {
    margin-top: 1em;
  }
</style>

<script>
import * as Analytics from '@/libs/analytics';
import { mapState } from '@/libs/store';

import upIcon from '@/assets/svg/up.svg';
import downIcon from '@/assets/svg/down.svg';

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
