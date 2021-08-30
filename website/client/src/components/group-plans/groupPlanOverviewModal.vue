<template>
  <b-modal
    id="group-plan-overview"
    title="Empty"
    size="lg"
    hide-footer="hide-footer"
  >
    <div
      slot="modal-header"
      class="header-wrap text-center"
    >
      <h2 v-once>
        {{ $t('gettingStarted') }}
      </h2>
      <p v-once>
        {{ $t('congratsOnGroupPlan') }}
      </p>
    </div>
    <div class="row">
      <div class="col-12">
        <div
          class="card"
          :class="{expanded: expandedQuestions.question1}"
        >
          <div class="question-head">
            <div class="q">
              Q.
            </div>
            <div class="title">
              {{ $t('whatsIncludedGroup') }}
            </div>
            <div
              class="arrow float-right"
              @click="toggle('question1')"
            >
              <div
                v-if="expandedQuestions.question1"
                class="svg-icon"
                v-html="icons.upIcon"
              ></div>
              <div
                v-else
                class="svg-icon"
                v-html="icons.downIcon"
              ></div>
            </div>
          </div>
          <div
            v-if="expandedQuestions.question1"
            class="question-body"
          >
            <p>{{ $t('whatsIncludedGroupDesc') }}</p>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="card"
          :class="{expanded: expandedQuestions.question2}"
        >
          <div class="question-head">
            <div class="q">
              Q.
            </div>
            <div class="title">
              {{ $t('howDoesBillingWork') }}
            </div>
            <div
              class="arrow float-right"
              @click="toggle('question2')"
            >
              <div
                v-if="expandedQuestions.question2"
                class="svg-icon"
                v-html="icons.upIcon"
              ></div>
              <div
                v-else
                class="svg-icon"
                v-html="icons.downIcon"
              ></div>
            </div>
          </div>
          <div
            v-if="expandedQuestions.question2"
            class="question-body"
          >
            <p>{{ $t('howDoesBillingWorkDesc') }}</p>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="card"
          :class="{expanded: expandedQuestions.question3}"
        >
          <div class="question-head">
            <div class="q">
              Q.
            </div>
            <div class="title">
              {{ $t('howToAssignTask') }}
            </div>
            <div
              class="arrow float-right"
              @click="toggle('question3')"
            >
              <div
                v-if="expandedQuestions.question3"
                class="svg-icon"
                v-html="icons.upIcon"
              ></div>
              <div
                v-else
                class="svg-icon"
                v-html="icons.downIcon"
              ></div>
            </div>
          </div>
          <div
            v-if="expandedQuestions.question3"
            class="question-body"
          >
            <p>{{ $t('howToAssignTaskDesc') }}</p>
            <div class="assign-tasks image-example"></div>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="card"
          :class="{expanded: expandedQuestions.question4}"
        >
          <div class="question-head">
            <div class="q">
              Q.
            </div>
            <div class="title">
              {{ $t('howToRequireApproval') }}
            </div>
            <div
              class="arrow float-right"
              @click="toggle('question4')"
            >
              <div
                v-if="expandedQuestions.question4"
                class="svg-icon"
                v-html="icons.upIcon"
              ></div>
              <div
                v-else
                class="svg-icon"
                v-html="icons.downIcon"
              ></div>
            </div>
          </div>
          <div
            v-if="expandedQuestions.question4"
            class="question-body"
          >
            <p>{{ $t('howToRequireApprovalDesc') }}</p>
            <div class="requires-approval image-example"></div>
            <p>{{ $t('howToRequireApprovalDesc2') }}</p>
            <div class="approval-requested image-example"></div>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="card"
          :class="{expanded: expandedQuestions.question5}"
        >
          <div class="question-head">
            <div class="q">
              Q.
            </div>
            <div class="title">
              {{ $t('whatIsGroupManager') }}
            </div>
            <div
              class="arrow float-right"
              @click="toggle('question5')"
            >
              <div
                v-if="expandedQuestions.question5"
                class="svg-icon"
                v-html="icons.upIcon"
              ></div>
              <div
                v-else
                class="svg-icon"
                v-html="icons.downIcon"
              ></div>
            </div>
          </div>
          <div
            v-if="expandedQuestions.question5"
            class="question-body"
          >
            <p>{{ $t('whatIsGroupManagerDesc') }}</p>
            <div class="promote-leader image-example"></div>
          </div>
        </div>
      </div>
      <div class="col-12 text-center">
        <button
          class="btn btn-primary close-button"
          @click="close()"
        >
          {{ $t('goToTaskBoard') }}
        </button>
      </div>
    </div>
  </b-modal>
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
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    toggle (question) {
      this.expandedQuestions[question] = !this.expandedQuestions[question];
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'group-plan-overview');
    },
  },
};
</script>
