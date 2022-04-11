<template>
  <base-notification
    v-if="worldBoss && worldBoss.active"
    :can-remove="false"
    :notification="{}"
    :read-after-click="false"
    @click="action"
  >
    <div
      slot="content"
      class="background"
    >
      <div class="text">
        <div
          v-once
          class="title"
        >
          {{ $t('worldBoss') }}
        </div>
        <div
          v-once
          class="sub-title"
        >
          {{ $t('questDysheartenerText') }}
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-left">
        <div>
          <div class="left-hearts"></div>
        </div>
        <div class="float-right">
          <div class="quest_dysheartener_notification"></div>
          <div class="phobia_dysheartener_notification"></div>
        </div>
      </div>
      <div class="health-bar d-flex align-items-center justify-content-center">
        <div
          class="svg-icon"
          v-html="icons.health"
        ></div>
        <div class="boss-health-wrap">
          <div
            class="boss-health-bar"
            :style="{width: (parseInt(bossHp) / questData.boss.hp) * 100 + '%'}"
          ></div>
        </div>
        <div class="pending-damage">
          <div
            v-once
            class="svg-icon"
            v-html="icons.sword"
          ></div>
          <span>+{{ parseInt(user.party.quest.progress.up) || 0 }}</span>
        </div>
      </div>
    </div>
  </base-notification>
</template>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
  .background {
    position: relative;
  }

  .notification {
    background-image: linear-gradient(to right, #410f2a, #931f4d 50%, #410f2a) !important;
    padding: 0 !important;
  }

  .notification ::v-deep .notification-content {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .title, .sub-title {
    color: #fff;
  }

  .title {
    font-size: 14px;
    font-weight: bold;
  }

  .text {
    position: absolute;
    margin-top: 1em;
    margin-left: 1em;
  }

  .sub-title {
    font-size: 14px;
  }

  .left-hearts {
    background-size: 100%;
    margin-left: 2em;
    margin-right: 1em;
    width: 106px;
    height: 41px;
    background-size: contain;
  }

  .left-hearts {
    background-image: url('~@/assets/images/world-boss/left-hearts@3x.png');
  }

  .quest_dysheartener_notification, .phobia_dysheartener_notification {
    width: 219px;
    height: 64px;
    background-size: 100%;
  }

  .phobia_dysheartener_notification {
    display: none;
  }

  .quest_dysheartener_notification {
    background-image: url('~@/assets/images/world-boss/mantis-static-notification@3x.png');
  }

  .phobia_dysheartener_notification {
    display: none;
    background-image: url('~@/assets/images/world-boss/heart-translucent-shadow-notification@3x.png');
  }

  .health-bar {
    width: 378px;
    height: 24px;
    background-color: #410f2a;
  }

  .boss-health-wrap {
    margin-left: .5em;
    margin-right: .5em;
    width: 274px;
    height: 12px;
    background-color: rgba(255, 255, 255, 0.24);
    border-radius: 2px;
  }

  .boss-health-bar {
    background-color: #f74e52;
    height: 12px;
    margin-bottom: .5em;
    border-radius: 2px;
  }

  .svg-icon {
    width: 16px;
    height: 16px;
  }

  .pending-damage {
    .svg-icon {
      display: inline-block;
      margin-right: .2em;
      margin-bottom: .2em;
    }

    span, .svg-icon {
      vertical-align: bottom;
    }

    color: #fff;
  }
</style>
<!-- eslint-enable max-len -->

<script>
import * as quests from '@/../../common/script/content/quests';

import { mapState } from '@/libs/store';
import BaseNotification from './base';

import health from '@/assets/svg/health.svg';
import sword from '@/assets/svg/sword.svg';
import { worldStateMixin } from '@/mixins/worldState';

export default {
  components: {
    BaseNotification,
  },
  mixins: [
    worldStateMixin,
  ],
  data () {
    const questData = quests.quests.dysheartener;

    return {
      icons: Object.freeze({
        health,
        sword,
      }),
      questData,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      worldBoss: 'worldState.data.worldBoss',
    }),
    bossHp () {
      if (this.worldBoss && this.worldBoss.progress) {
        return this.worldBoss.progress.hp;
      }
      return this.questData.boss.hp.toLocaleString();
    },
  },
  mounted () {
    this.triggerGetWorldState();
  },
  methods: {
    action () {
      this.$router.push({ name: 'tavern' });
    },
  },
};
</script>
