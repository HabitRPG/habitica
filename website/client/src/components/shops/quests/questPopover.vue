<template>
  <div class="questPopover">
    <h4
      v-if="item.locked"
      class="popover-content-title"
    >
      {{ $t('lockedItem') }}
    </h4>
    <h4
      v-else
      class="popover-content-title"
    >
      {{ item.text }}
    </h4>
    <div
      v-if="item.locked && item.key === 'lostMasterclasser1'"
      class="popover-content-text"
    >
      {{ $t('questUnlockLostMasterclasser') }}
    </div>
    <div
      v-if="item.locked && item.unlockCondition
        && item.unlockCondition.incentiveThreshold"
      class="popover-content-text"
    >
      {{ $t('loginIncentiveQuest', {
        count: item.unlockCondition.incentiveThreshold}) }}
    </div>
    <div
      v-if="item.locked && item.previous && isBuyingDependentOnPrevious(item)"
      class="popover-content-text"
    >
      {{ $t('unlockByQuesting', {title: item.previous}) }}
    </div>
    <div
      v-if="item.lvl > user.stats.lvl"
      class="popover-content-text"
    >
      {{ $t('mustLvlQuest', {level: item.lvl}) }}
    </div>
    <questInfo
      v-if="!item.locked"
      :quest="item"
    />
  </div>
</template>

<script>
import QuestInfo from './questInfo.vue';
import { mapState } from '@/libs/store';

export default {
  components: {
    QuestInfo,
  },
  props: ['item'],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    isBuyingDependentOnPrevious (item) {
      const questsNotDependentToPrevious = ['moon2', 'moon3'];
      if (item.key in questsNotDependentToPrevious) return false;
      return true;
    },
  },
};
</script>
