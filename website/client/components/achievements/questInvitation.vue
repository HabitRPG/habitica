<template lang="pug">
  b-modal#quest-invitation(v-if='user.party.quest.key && quests[user.party.quest.key]', :title="$t('questInvitation')", size='lg', :hide-footer="true")
    .modal-header
      h4 {{ $t('questInvitation') }}
        |&nbsp;{{quests[user.party.quest.key].text()}}
    .modal-body
      .pull-right-sm.text-center
        .col-centered(:class='`quest_${quests[user.party.quest.key].key}`')
        div(ng-if='quests[user.party.quest.key].boss')
          h4 {{quests[user.party.quest.key].boss.name()}}
          p
            strong {{ $t('bossHP') }} + ': '
            | {{quests[user.party.quest.key].boss.hp}}
          p
            strong {{ $t('bossStrength') }} + ': '
            | {{quests[user.party.quest.key].boss.str}}
        div(ng-if='quests[user.party.quest.key].collect')
          p(ng-repeat='(k,v) in quests[user.party.quest.key].collect')
            strong {{ $t('collect') }} + ': '
            | {{quests[user.party.quest.key].collect[k].count}} {{quests[user.party.quest.key].collect[k].text()}}
      div(ng-bind-html='quests[user.party.quest.key].notes()')
      .quest-rewards(:key='user.party.quest.key', header-participant="$t('rewardsAllParticipants')", header-quest-owner="$t('rewardsQuestOwner')")
      hr
      h5 {{headerParticipant}}
      table.table.table-striped
        tr(ng-repeat='drop in _.reject(quest.drop.items, \'onlyOwner\')')
          td {{drop.text()}}
        tr(ng-if='quest.drop.exp > 0')
          td {{quest.drop.exp}}&nbsp;
            | {{ $t('experience') }}
        tr(ng-if='quest.drop.gp > 0')
          td {{quest.drop.gp}}&nbsp;
            | {{ $t('gold') }}
        tr(ng-if='quest.drop.unlock()')
          td {{quest.drop.unlock()}}
      div(ng-if='getQuestOwnerRewards(quest).length > 0')
        h5 {{headerQuestOwner}}
        table.table.table-striped
          tr(ng-repeat='drop in getQuestOwnerRewards(quest)')
            td {{drop.text()}}
    .modal-footer
      button.btn.btn-secondary(ng-click='questHold = true; $close()') {{ $t('askLater') }}
      button.btn.btn-secondary(ng-click='questReject(); $close()') {{ $t('reject') }}
      button.btn.btn-primary(ng-click='questAccept(); $close()') {{ $t('accept') }}
</template>

<script>
import quests from 'common/script/content/quests';
import { mapState } from 'client/libs/store';
import percent from '../../../common/script/libs/percent';
import {maxHealth} from '../../../common/script/index';

export default {
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
      this.$root.$emit('bv::hide::modal', 'quest-invitation');
    },
  },
};
</script>
