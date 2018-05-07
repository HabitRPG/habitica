<template lang="pug">
.challenge
  .challenge-prize
    .number
      span.svg-icon(v-html="icons.gemIcon")
      span.value {{challenge.prize}}
    .label {{ $t('challengePrize') }}
  .challenge-header
    router-link(
      :to="{ name: 'challenge', params: { challengeId: challenge._id } }"
    )
      h3.challenge-title(v-markdown='challenge.name')
    .owner(v-if="fullLayout")
      .owner-item
        strong {{ $t('createdBy') }}:
        user-link.mx-1(:user="challenge.leader")
      .owner-item(v-if="challenge.group && !isTavern(challenge.group)")
        strong {{ $t(challenge.group.type) }}:
        group-link.mx-1(:group="challenge.group")
    .meta
      .meta-item
        .svg-icon.user-icon(v-html="icons.memberIcon")
        span.mx-1 {{challenge.memberCount}}
      // @TODO: add end date
        .meta-item
          .svg-icon(v-html="icons.calendarIcon")
          strong.mx-1 {{ $t('endDate')}}:
          span {{challenge.endDate}}
  category-tags(:categories="challenge.categories", :owner-id="challenge.leader._id", v-once)
  .challenge-description {{challenge.summary}}
  .well-wrapper(v-if="fullLayout")
    .well
      div(:class="{'muted': challenge.tasksOrder.habits.length === 0}")
        .number
          .svg-icon.habit-icon(v-html="icons.habitIcon")
          span.value {{challenge.tasksOrder.habits.length}}
        .label {{$t('habit')}}
      div(:class="{'muted': challenge.tasksOrder.dailys.length === 0}")
        .number
          .svg-icon.daily-icon(v-html="icons.dailyIcon")
          span.value {{challenge.tasksOrder.dailys.length}}
        .label {{$t('daily')}}
      div(:class="{'muted': challenge.tasksOrder.todos.length === 0}")
        .number
          .svg-icon.todo-icon(v-html="icons.todoIcon")
          span.value {{challenge.tasksOrder.todos.length}}
        div {{$t('todo')}}
      div(:class="{'muted': challenge.tasksOrder.rewards.length === 0}")
        .number
          .svg-icon.reward-icon(v-html="icons.rewardIcon")
          span.value {{challenge.tasksOrder.rewards.length}}
        .label {{$t('reward')}}

</template>

<style lang="scss">
  // Have to use this, because v-markdown creates p element in h3. Scoping doesn't work with it.
  .challenge-title > p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-height: 3em;
    line-height: 1.5em;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .challenge {
    background-color: $white;
    box-shadow: 0 2px 2px 0 rgba($black, 0.15), 0 1px 4px 0 rgba($black, 0.1);
    margin-bottom: 1em;
    border-radius: 4px;
    padding-bottom: .5em;

    .number {
      display: flex;
      align-items: center;
      justify-content: center;

      .svg-icon {
        margin-top: -.2em;
      }

      .value {
        margin-left: .5em;
        font-size: 24px;
      }
    }

    .label {
      font-size: .9em;
    }

    .challenge-prize {
      text-align: center;
      color: $gems-color;
      display: inline-block;
      float: right;
      padding: 1em 1.5em;
      margin-left: 1em;
      background: #eefaf6;
      border-bottom-left-radius: 4px;

      .svg-icon {
        width: 32px;
      }
    }

    .challenge-header,
    .well-wrapper {
      padding: 1em 1.5em;
    }

    .challenge-header {
      padding-bottom: .5em;
    }

    .owner {
      margin: 1em 0 .5em;
    }

    .meta, .owner {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    .meta-item, .owner-item {
      display: inline-flex;
      color: $gray-200;
      align-items: center;
      margin-right: 1em;
      white-space: nowrap;

      .svg-icon {
        color: $gray-300;
        width: 14px;
      }
    }

    .user-icon {
      width: 20px !important;
    }

    .habit-icon {
      width: 30px;
    }

    .todo-icon {
      width: 20px;
    }

    .daily-icon {
      width: 24px;
    }

    .reward-icon {
      width: 26px;
    }

    .categories {
      clear: right;
      display: flex;
      padding: 0 1.5em 1em;
      flex-wrap: wrap;
    }

    .category-label {
      margin-top: .5em;
    }

    .challenge-description {
      color: $gray-200;
      margin: 0 1.5em;
      word-break: break-all;
    }

    .well {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      background-color: $gray-700;
      text-align: center;
      padding: 1em;
      border-radius: .25em;

      > div {
        color: $gray-200;

        .svg-icon {
          color: $gray-300;
        }
      }

      > div.muted {
        color: $gray-400;

        .svg-icon {
          color: $gray-500;
        }
      }
    }

  }
</style>

<script>
  import { TAVERN_ID } from '../../../common/script/constants';
  import userLink from '../userLink';
  import groupLink from '../groupLink';
  import categoryTags from '../categories/categoryTags';
  import markdownDirective from 'client/directives/markdown';

  import gemIcon from 'assets/svg/gem.svg';
  import memberIcon from 'assets/svg/member-icon.svg';
  import calendarIcon from 'assets/svg/calendar.svg';
  import habitIcon from 'assets/svg/habit.svg';
  import todoIcon from 'assets/svg/todo.svg';
  import dailyIcon from 'assets/svg/daily.svg';
  import rewardIcon from 'assets/svg/reward.svg';

  export default {
    props: {
      challenge: {
        required: true,
      },
      fullLayout: {
        default: true,
      },
    },
    components: {
      userLink,
      groupLink,
      categoryTags,
    },
    data () {
      return {
        icons: Object.freeze({
          gemIcon,
          memberIcon,
          calendarIcon,
          habitIcon,
          todoIcon,
          dailyIcon,
          rewardIcon,
        }),
      };
    },
    directives: {
      markdown: markdownDirective,
    },
    methods: {
      isTavern (group) {
        return group._id === TAVERN_ID;
      },
    },
  };
</script>
