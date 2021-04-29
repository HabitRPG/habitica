<template>
  <small-modal id="level-up" :title="title">
    <starred>
      <avatar
        class="avatar"
        :member="user"
        hide-class-badge
      />
    </starred>

    <p class="text">{{ $t('levelup') }}</p>

    <template #greyed>
      <div v-if="displayRewardQuest">
        <your-rewards />
        <div :class="questClass"></div>
      </div>
    </template>
  </small-modal>
</template>

<style lang="scss">
  .avatar {
    cursor: auto;
  }

  .text {
    margin: 1rem;
  }

  .scroll {
    margin: -11px auto 0;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import Avatar from '@/components/avatar';
import smallModal from '@/components/ui/modal/smallModal';
import starred from '@/components/ui/modal/starred.vue';
import yourRewards from '@/components/ui/modal/your-rewards.vue';

const levelQuests = {
  15: 'atom1',
  30: 'vice1',
  40: 'goldenknight1',
  60: 'moonstone1',
};

export default {
  components: {
    Avatar,
    smallModal,
    starred,
    yourRewards,
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    title () {
      return this.$t('reachedLevel', { level: this.user.stats.lvl });
    },
    displayRewardQuest () {
      return this.user.stats.lvl in levelQuests;
    },
    questClass () {
      return `scroll inventory_quest_scroll_${levelQuests[this.user.stats.lvl]}`;
    },
  },
};
</script>
