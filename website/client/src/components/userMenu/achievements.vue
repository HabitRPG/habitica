<template>
  <div class="standard-page container">
    <div
      v-for="(category, key) in achievements"
      class="row"
    >
      <h2 class="col-12">
        {{ $t(key+'Achievs') }}
      </h2><div
        v-for="achievment in category.achievements"
        class="col-3 text-center"
      >
        <div
          class="achievement-container"
          :data-popover-html="achievment.title + achievment.text"
          popover-placement="achievPopoverPlacement"
          popover-append-to-body="achievAppendToBody"
        >
          <div
            popover-trigger="mouseenter"
            :data-popover-html="achievment.title + achievment.text"
            popover-placement="achievPopoverPlacement"
            popover-append-to-body="achievAppendToBody"
          >
            <div
              v-if="achievment.earned"
              class="achievement"
              :class="achievment.icon + '2x'"
            >
              <div
                v-if="achievment.optionalCount"
                class="counter badge badge-info stack-count"
              >
                {{ achievment.optionalCount }}
              </div>
            </div><div
              v-if="!achievment.earned"
              class="achievement achievement-unearned2x"
            ></div>
          </div>
        </div>
      </div>
    </div><div class="row">
      <div class="col-6">
        <h2>Challeges Won</h2><div v-for="chal in user.achievements.challenges">
          <span>{{ chal }}</span>
        </div>
      </div><div class="col-6">
        <h2>Quests Completed</h2><div v-for="(value, key) in user.achievements.quests">
          <span>{{ content.quests[k].text() }}</span><span>{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
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
import { mapState } from '@/libs/store';

import achievementsLib from '@/../../common/script/libs/achievements';
import Content from '@/../../common/script/content';

export default {
  data () {
    return {
      achievements: {},
      content: Content,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.achievements = achievementsLib.getAchievementsForProfile(this.user);
  },
};
</script>
