<template lang="pug">
div
  b-modal#owned-quests-modal(title="Which quest do you want to start?", size='md', hide-footer=true)
    .row.content
      .quest(v-for='(value, key, index) in user.items.quests', :class="'inventory_quest_scroll_' + key", @click='selectQuest(key)')
      button.btn.btn-primary(@click='confirm()') Confirm
  start-quest-modal(:group='group', :selectedQuest='selectedQuest')
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  .content {
    padding: 2em;

    .quest {
      margin-right: 1em;
      margin-bottom: 1em;
      display: inline-block;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import bModal from 'bootstrap-vue/lib/components/modal';

import startQuestModal from './startQuestModal';

export default {
  props: ['group'],
  components: {
    bModal,
    startQuestModal,
  },
  data () {
    return {
      selectedQuest: {},
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    selectQuest (quest) {
      this.selectedQuest = quest;
    },
    confirm () {
      this.$root.$emit('show::modal', 'start-quest-modal');
      this.$root.$emit('hide::modal', 'owned-quests-modal');
    },
  },
};
</script>
