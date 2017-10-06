<template lang="pug">
.card
  .row
    router-link.col-12(:to="{ name: 'challenge', params: { challengeId: challenge._id } }")
      h3(v-markdown='challenge.name')
  .row
    .col-6
      div.details
        span
          .svg-icon.member-icon(v-html="icons.memberIcon")
        span {{challenge.memberCount}}
        // @TODO: Add in V2
          span
            .svg-icon.calendar-icon(v-html="icons.calendarIcon")
          span
            strong End Date:
          span {{challenge.endDate}}
      div.tags
        span.tag(v-for='tag in challenge.tags') {{tag}}
    .col-6.prize-section
      div
        span.svg-icon.gem(v-html="icons.gemIcon")
        span.prize {{challenge.prize}}
      div Challenge Prize
  .row.description
    .col-12
      | {{challenge.summary}}
  .well.row
    .col-3
      .count-details
        .svg-icon.habit-icon(v-html="icons.habitIcon")
        span.count {{challenge.tasksOrder.habits.length}}
      div {{$t('habit')}}
    .col-3
      .count-details
        .svg-icon.daily-icon(v-html="icons.dailyIcon")
        span.count {{challenge.tasksOrder.dailys.length}}
      div {{$t('daily')}}
    .col-3
      .count-details
        .svg-icon.todo-icon(v-html="icons.todoIcon")
        span.count {{challenge.tasksOrder.todos.length}}
      div {{$t('todo')}}
    .col-3
      .count-details
        .svg-icon.reward-icon(v-html="icons.rewardIcon")
        span.count {{challenge.tasksOrder.rewards.length}}
      div {{$t('reward')}}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .card {
    background-color: $white;
    box-shadow: 0 2px 2px 0 $gray-600, 0 1px 4px 0 $gray-600;
    padding: 2em;
    height: 350px;
    margin-bottom: 1em;

    .gem {
      width: 32px;
    }

    .member-icon {
      width: 20px;
    }

    .calendar-icon {
      width: 14px;
    }

    span {
      display: inline-block;
      font-size: 14px;
      color: $gray-200;
      margin-right: 1em;
      vertical-align: bottom;
    }

    .details {
      margin: 1em 0;
    }

    .tags {
      margin-bottom: 1em;
    }

    .tag {
      border-radius: 30px;
      background-color: $gray-600;
      padding: .5em;
    }

    .prize {
      color: $gray-100;
      font-size: 24px;
    }

    .prize-section {
      text-align: right;
      padding-right: 2em;
    }

    .description {
      color: $gray-200;
      margin-top: 1em;
      margin-bottom: 1em;
      overflow: hidden;
      height: 80px;
    }

    .well-wrapper {
      padding: .8em;
    }

    .well {
      background-color: $gray-700;
      text-align: center;
      padding: 2em;
      border-radius: 4px;
      margin-left: .2em;
      margin-right: .2em;

      .svg-icon {
        display: inline-block;
        margin-left: .5em;
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

      .count-details span {
        margin-right: .5em;
      }

      .count {
        font-size: 20px;
        margin-left: .5em;
      }
    }
  }
</style>

<script>
import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';
import calendarIcon from 'assets/svg/calendar.svg';
import habitIcon from 'assets/svg/habit.svg';
import todoIcon from 'assets/svg/todo.svg';
import dailyIcon from 'assets/svg/daily.svg';
import rewardIcon from 'assets/svg/reward.svg';
import markdownDirective from 'client/directives/markdown';

export default {
  props: ['challenge'],
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
};
</script>
