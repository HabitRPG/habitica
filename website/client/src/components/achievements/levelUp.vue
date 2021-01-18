<template>
  <small-modal id="level-up" :title="title" has-rewards>
    <template #starred>
      <avatar
        class="avatar"
        :member="user"
        :hide-class-badge="true"
      />
    </template>

    {{ $t('levelup') }}

    <template #greyed>
      <div :class="questClass" v-if="displayRewardQuest"></div>
    </template>
  </small-modal>
</template>

<style lang="scss">
  .avatar {
    cursor: auto;
  }

  .scroll {
    margin: -11px auto 0;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import Avatar from '../avatar';
import smallModal from '../ui/smallModal';

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
