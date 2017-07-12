<template lang="pug">
  .standard-page
    h1 Achievements
    .row
      .col-12(v-for='(category, key) in achievements')
        h2 {{ $t(key+'Achievs') }}
        .row
          .col-1(v-for='achievment in category.achievements')
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

      .col-12(:class="{ muted: !user.achievements.challenges.length }")
        h2(v-once) {{ $t('challengeWinner') }}
        div(v-for='chal in user.achievements.challenges')
          span {{chal}}

      .col-12(:class="{ muted: !user.achievements.quests }")
        h2(v-once) {{ $t('completedQuests') }}
        div(v-for='(value, key) in user.achievements.quests')
          span {{ content.quests[k].text() }}
          span {{ value }}
</template>

<style lang='scss' scoped>
  h2 {
    margin-top: 2em;
  }

  .achievement-container {
    margin-bottom: 1em;
  }

  .counter.badge {
    color: #fff;
    position: absolute;
    bottom: 0;
    left: 44px;
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
