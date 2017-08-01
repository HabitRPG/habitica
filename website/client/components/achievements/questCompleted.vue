<template lang="pug">
  b-modal#quest-completed(:title="$t('lostAllHealth')", size='lg', :hide-footer="true")
    .modal-header
      h4 "{{quests[user.party.quest.completed].text()}}"&nbsp;
        | {{ $t('completed') }}
    .modal-body
      .col-centered(:class='`quest_${user.party.quest.completed}`')
      p(v-html='quests[user.party.quest.completed].completion()')
      .quest-rewards(key='user.party.quest.completed', header-participant="$t('youReceived')", header-quest-owner="$t('questOwnerReceived')")
    .modal-footer
      button.btn.btn-primary(@click='setQuestCompleted()') {{ $t('ok') }}
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import quests from 'common/script/content/quests';
import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
import revive from '../../../common/script/ops/revive';
import percent from '../../../common/script/libs/percent';
import {maxHealth} from '../../../common/script/index';

export default {
  components: {
    bModal,
    Avatar,
  },
  data () {
    return {
      maxHealth,
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
      // @TODO: set({"party.quest.completed":""})
      this.close();
    },
  },
};
</script>
