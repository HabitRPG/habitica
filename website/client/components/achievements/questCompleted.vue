<template lang="pug">
  b-modal#quest-completed(v-if='user.party.quest.completed', :title="quests[user.party.quest.completed].text() + '' + $t('completed')",
    size='lg', :hide-footer="true")
    .modal-body.text-center
      div(:class='`quest_${user.party.quest.completed}`')
      p(v-html='quests[user.party.quest.completed].completion()')
      .quest-rewards(key='user.party.quest.completed', header-participant="$t('youReceived')", header-quest-owner="$t('questOwnerReceived')")
    .modal-footer
      button.btn.btn-primary(@click='setQuestCompleted()') {{ $t('ok') }}
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import quests from 'common/script/content/quests';

import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
import percent from '../../../common/script/libs/percent';
import { maxHealth } from '../../../common/script/index';

export default {
  components: {
    bModal,
    Avatar,
  },
  data () {
    return {
      maxHealth,
      quests,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    barStyle () {
      return {
        width: `${percent(this.user.stats.hp, maxHealth)}%`,
      };
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'quest-completed');
    },
    setQuestCompleted () {
      this.$store.dispatch('user:set', {'party.quest.completed': ''});
      this.close();
    },
  },
};
</script>
