<template lang="pug">
  b-modal#quest-completed(v-if='user.party.quest.completed', :title="title",
    size='md', :hide-footer="true")
    .modal-body.text-center
      .quest(:class='`quest_${user.party.quest.completed}`')
      p(v-html='this.questData.completion()')
      .quest-rewards(key='user.party.quest.completed', header-participant="$t('youReceived')", header-quest-owner="$t('questOwnerReceived')")
    .modal-footer
      button.btn.btn-primary(@click='setQuestCompleted()') {{ $t('ok') }}
</template>

<style scoped>
  .quest {
    margin: 0 auto;
  }
</style>

<script>
import quests from 'common/script/content/quests';

import { mapState } from 'client/libs/store';
import percent from '../../../common/script/libs/percent';
import { maxHealth } from '../../../common/script/index';

export default {
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
