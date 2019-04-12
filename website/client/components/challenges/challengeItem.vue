<template lang="pug">
.challenge
  .challenge-prize
    .number
      span.svg-icon(v-html="icons.gemIcon")
      span.value {{challenge.prize}}
    .label {{ $t('prize') }}
  .challenge-header
    router-link(
      :to="{ name: 'challenge', params: { challengeId: challenge._id } }"
    )
      h3.challenge-title(v-markdown='challenge.name')
    .meta-info
      .member-count
        .svg-icon.user-icon(v-html="icons.memberIcon")
        span.count-label {{challenge.memberCount}}
      .divider
      .official(v-if="isOfficial")
        .svg-icon.user-icon(v-html="icons.officialIcon")
      .owner(v-if="fullLayout")
        .owner-item
          strong {{ $t('createdBy') }}:
          user-link.mx-1(:user="challenge.leader")
        .owner-item(v-if="challenge.group && !isTavern(challenge.group)")
          strong {{ $t(challenge.group.type) }}:
          group-link.mx-1(:group="challenge.group")
  category-tags.challenge-categories(
    :categories="challenge.categories",
    :owner="isOwner",
    :member="isMember",
  )
  .challenge-description(v-markdown='challenge.summary')
  .well-wrapper(v-if="fullLayout")
    .well
      div(v-for="task in tasksData", :class="{'muted': task.value === 0}")
        .number
          .svg-icon(v-html="task.icon", :class="task.label + '-icon'")
          span.value {{ task.value }}
        .label {{$t(task.label)}}
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  // Have to use this, because v-markdown creates p element in h3. Scoping doesn't work with it.
  .challenge-title > p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-height: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    font-size: 20px;
    font-weight: bold;
    font-style: normal;
    font-stretch: condensed;
    line-height: 1.4;
    letter-spacing: normal;
    color: $gray-10;
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

    .official {
      margin-right: 8px;
    }

    .challenge-prize {
      text-align: center;
      color: $gems-color;
      display: inline-block;
      float: right;
      padding: 18px 24px;
      margin-left: 1em;
      background: #24cc8f19;
      border-bottom-left-radius: 4px;
      width: 107px;
      height: 80px;

      .svg-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .value {
        margin-left: 8px;
        font-size: 20px;
        font-weight: bold;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.4;
        letter-spacing: normal;
        color: #1ca372;
      }

      .label {
        margin-top: 4px;
        font-size: 12px;
        font-weight: bold;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.33;
        letter-spacing: normal;
        text-align: center;
        color: #1ca372;
      }
    }

    .divider {
      width: 1px;
      height: 16px;
      background-color: $gray-600;
      margin-right: 12px;
      margin-left: 12px;
    }

    .challenge-header {
      padding: 16px 20px;
    }

    .well-wrapper {
      padding: 16px 20px 20px;
    }

    .challenge-header {
      padding-bottom: 0;
    }

    .meta-info {
      height: 24px;
      margin-bottom: 8px;
    }

    .count-label {
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.71;
      letter-spacing: normal;
      color: $gray-50;
      margin-left: 4px;
    }

    .meta-info, .owner, .member-count {
      display: inline-flex;
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

    .challenge-categories {
      clear: right;
      display: flex;
      padding: 0 20px 16px;
      flex-wrap: wrap;
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

    .challenge-description {
      margin: 0 20px 0;
      word-break: break-word;

      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.71;
      letter-spacing: normal;
      color: $gray-50;
    }

    .well {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      background-color: $gray-700;
      text-align: center;
      padding: 16px;
      border-radius: .25em;

      > div {
        .value {
          font-size: 20px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.4;
          letter-spacing: normal;
          color: $gray-50;
        }

        .label {
          font-size: 12px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.33;
          letter-spacing: normal;
          text-align: center;
          color: $gray-100;
        }

        .svg-icon {
          object-fit: contain;
          color: $gray-100;
        }
      }

      > div.muted {
        .value {
          opacity: 0.5;
          font-size: 20px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.4;
          letter-spacing: normal;
          color: $gray-50;
        }

        .label {
          opacity: 0.5;
          font-size: 12px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.33;
          letter-spacing: normal;
          text-align: center;
          color: $gray-100;
        }

        .svg-icon {
          object-fit: contain;
          opacity: 0.5;
          color: $gray-100;
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
  import {mapState} from 'client/libs/store';

  import gemIcon from 'assets/svg/gem.svg';
  import memberIcon from 'assets/svg/member-icon.svg';
  import calendarIcon from 'assets/svg/calendar.svg';
  import habitIcon from 'assets/svg/habit.svg';
  import todoIcon from 'assets/svg/todo.svg';
  import dailyIcon from 'assets/svg/daily.svg';
  import rewardIcon from 'assets/svg/reward.svg';
  import officialIcon from 'assets/svg/official.svg';

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
    directives: {
      markdown: markdownDirective,
    },
    data () {
      return {
        icons: Object.freeze({
          gemIcon,
          memberIcon,
          calendarIcon,
          officialIcon,
        }),
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
      isOwner () {
        return this.challenge.leader && this.challenge.leader._id === this.user._id;
      },
      isMember () {
        return this.user.challenges.indexOf(this.challenge._id) !== -1;
      },
      isOfficial () {
        return this.challenge.official || this.challenge.categories.map(category => category.slug).includes('habitica_official');
      },
      tasksData () {
        return [
          {
            icon: habitIcon,
            label: 'habit',
            value: this.challenge.tasksOrder.habits.length,
          },
          {
            icon: dailyIcon,
            label: 'daily',
            value: this.challenge.tasksOrder.dailys.length,
          },
          {
            icon: todoIcon,
            label: 'todo',
            value: this.challenge.tasksOrder.todos.length,
          },
          {
            icon: rewardIcon,
            label: 'reward',
            value: this.challenge.tasksOrder.rewards.length,
          },
        ];
      },
    },
    methods: {
      isTavern (group) {
        return group._id === TAVERN_ID;
      },
    },
  };
</script>
