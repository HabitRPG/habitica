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
      <div class="quest-rewards text-center">
        <h3 v-once>
          {{ $t('paymentYouReceived') }}
        </h3>
        <questDialogDrops :item="questData" />
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

<style scoped>
  .quest {
    margin: 0 auto;
  }

  .quest-rewards .questRewards {
    margin: 0 auto;
  }
</style>

<script>
import * as quests from '@/../../common/script/content/quests';
import questDialogDrops from '@/components/shops/quests/questDialogDrops';

import { mapState } from '@/libs/store';
import percent from '@/../../common/script/libs/percent';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';

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
