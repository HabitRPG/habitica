<template>
  <b-modal
    v-if="user.party.quest.key && quests[user.party.quest.key]"
    id="quest-invitation"
    :title="$t('questInvitation')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-header">
      <h4>{{ $t('questInvitation') }}&nbsp;{{ quests[user.party.quest.key].text() }}</h4>
    </div>
    <div class="modal-body">
      <div class="pull-right-sm text-center">
        <div
          class="col-centered"
          :class="`quest_${quests[user.party.quest.key].key}`"
        ></div>
        <div ng-if="quests[user.party.quest.key].boss">
          <h4>{{ quests[user.party.quest.key].boss.name() }}</h4>
          <p>
            <strong>{{ $t('bossHP') }} + ': '</strong>
            {{ quests[user.party.quest.key].boss.hp }}
          </p>
          <p>
            <strong>{{ $t('bossStrength') }} + ': '</strong>
            {{ quests[user.party.quest.key].boss.str }}
          </p>
        </div>
        <div ng-if="quests[user.party.quest.key].collect">
          <p ng-repeat="(k,v) in quests[user.party.quest.key].collect">
            <strong>{{ $t('collect') }} + ': '</strong>
            {{ quests[user.party.quest.key].collect[k].count }} {{ quests[user.party.quest.key].collect[k].text() }} <!-- eslint-disable-line max-len -->
          </p>
        </div>
      </div>
      <div ng-bind-html="quests[user.party.quest.key].notes()"></div>
      <div
        :key="user.party.quest.key"
        class="quest-rewards"
        header-participant="$t('rewardsAllParticipants')"
        header-quest-owner="$t('rewardsQuestOwner')"
      ></div>
      <hr>
      <h5>{{ headerParticipant }}</h5>
      <table class="table table-striped">
        <tr ng-repeat="drop in _.reject(quest.drop.items, 'onlyOwner')">
          <td>{{ drop.text() }}</td>
        </tr>
        <tr ng-if="quest.drop.exp > 0">
          <td>{{ quest.drop.exp }}&nbsp;{{ $t('experience') }}</td>
        </tr>
        <tr ng-if="quest.drop.gp > 0">
          <td>{{ quest.drop.gp }}&nbsp;{{ $t('gold') }}</td>
        </tr>
        <tr ng-if="quest.drop.unlock()">
          <td>{{ quest.drop.unlock() }}</td>
        </tr>
      </table>
      <div ng-if="getQuestOwnerRewards(quest).length > 0">
        <h5>{{ headerQuestOwner }}</h5>
        <table class="table table-striped">
          <tr ng-repeat="drop in getQuestOwnerRewards(quest)">
            <td>{{ drop.text() }}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        ng-click="questHold = true; $close()"
      >
        {{ $t('askLater') }}
      </button>
      <button
        class="btn btn-secondary"
        ng-click="questReject(); $close()"
      >
        {{ $t('reject') }}
      </button>
      <button
        class="btn btn-primary"
        ng-click="questAccept(); $close()"
      >
        {{ $t('accept') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
import * as quests from '@/../../common/script/content/quests';
import { mapState } from '@/libs/store';
import percent from '@/../../common/script/libs/percent';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';

export default {
  data () {
    return {
      maxHealth,
      quests,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    barStyle () {
      return {
        width: `${percent(this.user.stats.hp, maxHealth)}%`,
      };
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'quest-invitation');
    },
  },
};
</script>
