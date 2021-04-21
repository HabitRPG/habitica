<template>
  <b-modal
    v-if="user.party.quest.completed"
    id="quest-completed"
    :title="title"
    size="md"
    :hide-footer="true"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    @hide="hide"
  >
    <div class="modal-body text-center">
      <div
        class="quest"
        :class="`quest_${user.party.quest.completed}`"
      ></div>
      <p
        v-if="questData.completion && typeof questData.completion === 'function'"
        v-html="questData.completion()"
      ></p>
      <div class="text-center">
        <h3 v-once>
          {{ $t('paymentYouReceived') }}
        </h3>
        <quest-rewards :quest="questData" />
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn btn-primary"
        @click="setQuestCompleted()"
      >
        {{ $t('ok') }}
      </button>
    </div>
  </b-modal>
</template>

<style scoped lang="scss">
  .quest {
    margin: 0 auto;
  }
</style>

<style lang="scss">
 #quest-completed {
   .quest-rewards {
     margin-left: -2rem;
     margin-right: -2rem;
   }
 }
</style>

<script>
import * as quests from '@/../../common/script/content/quests';

import { mapState } from '@/libs/store';
import percent from '@/../../common/script/libs/percent';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';
import QuestRewards from '../shops/quests/questRewards';

export default {
  components: {
    QuestRewards,
  },
  data () {
    return {
      maxHealth,
      quests,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
      this.close();
    },
    hide () {
      this.$store.dispatch('user:set', { 'party.quest.completed': '' });
    },
  },
};
</script>
