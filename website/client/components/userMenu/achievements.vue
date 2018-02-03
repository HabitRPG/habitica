<template lang="pug">
  .standard-page.container
    .row(v-for='(category, key) in achievements')
      h2.col-12 {{ $t(key+'Achievs') }}
      .col-3.text-center(v-for='achievment in category.achievements')
        div.achievement-container(:data-popover-html='achievment.title + achievment.text',
          popover-placement='achievPopoverPlacement',
          popover-append-to-body='achievAppendToBody')
          div(popover-trigger='mouseenter',
            :data-popover-html='achievment.title + achievment.text',
            popover-placement='achievPopoverPlacement',
            popover-append-to-body='achievAppendToBody')
              .achievement(:class='achievment.icon + "2x"', v-if='achievment.earned')
               .counter.badge.badge-info.stack-count(v-if='achievment.optionalCount') {{achievment.optionalCount}}
              .achievement(class='achievement-unearned2x', v-if='!achievment.earned')
    .row
      .col-6
        h2 Challeges Won
        div(v-for='chal in user.achievements.challenges')
          span {{chal}}
      .col-6
        h2 Quests Completed
        div(v-for='(value, key) in user.achievements.quests')
          span {{ content.quests[k].text() }}
          span {{ value }}
</template>

<style lang="scss" scoped>
  h2 {
    margin-top: 2em;
  }

  .achievement-container {
    margin-bottom: 1em;
    padding: 2em;
    background: #fff;
  }

  .achievement {
    margin: 0 auto;
  }

  .counter.badge {
    color: #fff;
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ff944c;
  }
</style>

<script>
import { mapState } from 'client/libs/store';

import achievementsLib from '../../../common/script/libs/achievements';
import Content from '../../../common/script/content';

export default {
  data () {
    return {
      achievements: {},
      content: Content,
    };
  },
  mounted () {
    this.achievements = achievementsLib.getAchievementsForProfile(this.user);
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
};
</script>
