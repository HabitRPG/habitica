<template lang="pug">
  b-modal#quest-completed(v-if='user.party.quest.completed', :title="title",
    size='md', :hide-footer="true")
    .modal-body.text-center
      .quest(:class='`quest_${user.party.quest.completed}`')
      p(v-if='questData.completion && typeof questData.completion === "function"', v-html='questData.completion()')
      .quest-rewards.text-center
        h3 {{ $t('youReceived') }}
        questDialogDrops(:item="questData")
    .modal-footer
      button.btn.btn-primary(@click='setQuestCompleted()') {{ $t('ok') }}
</template>

<style scoped>
  .quest {
    margin: 0 auto;
  }

  .quest-rewards .questRewards {
    margin: 0 auto;
  }
</style>

<script>
import quests from 'common/script/content/quests';
import questDialogDrops from 'client/components/shops/quests/questDialogDrops';

import { mapState } from 'client/libs/store';
import percent from '../../../common/script/libs/percent';
import { maxHealth } from '../../../common/script/index';

export default {
  components: {
    questDialogDrops,
  },
  data () {
    return {
      maxHealth,
      quests,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    questData () {
      return this.quests.quests[this.user.party.quest.completed];
    },
    title () {
      return `${this.questData.text()} ${this.$t('completed')}`;
    },
    barStyle () {
      return {
        width: `${percent(this.user.stats.hp, maxHealth)}%`,
      };
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'quest-completed');
    },
    setQuestCompleted () {
      this.$store.dispatch('user:set', {'party.quest.completed': ''});
      this.close();
    },
  },
};
</script>
