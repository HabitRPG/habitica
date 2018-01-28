<template lang="pug">
div
  .row
    .col-10
      h3(v-once) {{ $t('questDetailsTitle') }}
    .col-2
      .toggle-up(@click="toggle()", v-if="show")
        .svg-icon(v-html="icons.upIcon")
      .toggle-down(@click="toggle()", v-if="!show")
        .svg-icon(v-html="icons.downIcon")
  .section(v-if="show")
    .row.no-quest-section(v-if='!onPendingQuest && !onActiveQuest')
      .col-12.text-center
        .svg-icon(v-html="icons.questIcon")
        h4(v-once) {{ $t('youAreNotOnQuest') }}
        p(v-once) {{ $t('questDescription') }}
        button.btn.btn-secondary(v-once, @click="openStartQuestModal()") {{ $t('startAQuest') }}
    .row.quest-active-section(v-if='onPendingQuest && !onActiveQuest')
      .col-2
        .quest(:class='`inventory_quest_scroll_${questData.key}`')
      .col-6.titles
        strong {{ questData.text() }}
        p {{acceptedCount}} / {{group.memberCount}}
      .col-4
        button.btn.btn-secondary(@click="openQuestDetails()") {{ $t('details') }}
    .row.quest-active-section.quest-invite(v-if='user.party.quest && user.party.quest.RSVPNeeded')
      span {{ $t('wouldYouParticipate') }}
      button.btn.btn-primary.accept(@click='questAccept(group._id)') {{$t('accept')}}
      button.btn.btn-primary.reject(@click='questReject(group._id)') {{$t('reject')}}
    .row.quest-active-section(v-if='!onPendingQuest && onActiveQuest')
      .col-12.text-center
        .quest-boss(:class="'quest_' + questData.key")
        h3(v-once) {{ questData.text() }}
        .quest-box
          .collect-info(v-if='questData.collect')
            .row(v-for='(value, key) in questData.collect')
              .col-2
                div(:class="'quest_' + questData.key + '_' + key")
              .col-10
                strong {{value.text()}}
                .grey-progress-bar
                  .collect-progress-bar(:style="{width: (group.quest.progress.collect[key] / value.count) * 100 + '%'}")
                strong {{group.quest.progress.collect[key]}} / {{value.count}}
          .boss-info(v-if='questData.boss')
            .row
              .col-6
                h4.float-left(v-once) {{ questData.boss.name() }}
              .col-6
                span.float-right(v-once) {{ $t('participantsTitle') }}
            .row
              .col-12
                .grey-progress-bar
                  .boss-health-bar(:style="{width: (group.quest.progress.hp / questData.boss.hp) * 100 + '%'}")
            .row.boss-details
                .col-6
                  span.float-left
                    | {{parseFloat(group.quest.progress.hp).toFixed(2)}} / {{parseFloat(questData.boss.hp).toFixed(2)}}
                .col-6(v-if='userIsOnQuest')
                  // @TODO: Why do we not sync quset progress on the group doc? Each user could have different progress
                  span.float-right {{parseFloat(user.party.quest.progress.up).toFixed(1) || 0}} pending damage
            .row.rage-bar-row(v-if='questData.boss.rage')
              .col-12
                .grey-progress-bar
                  .boss-health-bar.rage-bar(:style="{width: (group.quest.progress.rage / questData.boss.rage.value) * 100 + '%'}")
            .row.boss-details.rage-details(v-if='questData.boss.rage')
                .col-6
                  span.float-left {{ $t('rage') }} {{ parseFloat(group.quest.progress.rage).toFixed(2) }} / {{ questData.boss.rage.value }}
        button.btn.btn-secondary(v-once, @click="questAbort()", v-if='canEditQuest') {{ $t('abort') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .svg-icon {
    height: 25px;
    width: 25px;
  }

  .quest-boss {
    margin: 0 auto;
  }

  .boss-health-bar {
    width: 80%;
    background-color: red;
    height: 15px;
    margin-bottom: .5em;
  }

  .rage-details {
    margin-bottom: 1em;
  }

  .boss-health-bar.rage-bar {
    margin-top: 1em;
    background-color: orange;
  }

  .grey-progress-bar {
    width: 100%;
    height: 15px;
    background-color: #e1e0e3;
  }

  .collect-progress-bar {
    background-color: #24cc8f;
    height: 15px;
    max-width: 100%;
  }

  .no-quest-section {
    padding: 2em;
    color: $gray-300;

    h4 {
      color: $gray-300;
    }

    p {
      margin-bottom: 2em;
    }

    .svg-icon {
      height: 30px;
      width: 30px;
      margin: 0 auto;
      margin-bottom: 2em;
    }
  }

  .quest-active-section {
    .titles {
        padding-top: .5em;
    }

    .quest-box {
      background-image: url('~client/assets/svg/for-css/quest-border.svg');
      background-size: 100% 100%;
      width: 100%;
      padding: .5em;
      margin-bottom: 1em;

      svg: {
        width: 100%;
        height: 100%;
      }
    }

    .boss-info, .collect-info {
      width: 90%;
      margin: 0 auto;
      text-align: left;
    }
  }

  .quest-invite {
    background-color: #2995cd;
    color: #fff;
    padding: 1em;

    span {
      margin-top: .3em;
    	font-size: 14px;
    	font-weight: bold;
    }

    .accept, .reject {
      padding: .2em 1em;
      font-size: 12px;
      height: 24px;
    	border-radius: 2px;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    }

    .accept {
    	background-color: #24cc8f;
    	margin-left: 4em;
      margin-right: .5em;
    }

    .reject {
    	border-radius: 2px;
    	background-color: #f74e52;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';

import quests from 'common/script/content/quests';
import percent from 'common/script/libs/percent';

import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';
import questIcon from 'assets/svg/quest.svg';

export default {
  props: ['show', 'group'],
  data () {
    return {
      icons: Object.freeze({
        upIcon,
        downIcon,
        questIcon,
      }),
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    userIsOnQuest () {
      if (!this.group.quest || !this.group.quest.members) return false;
      return Boolean(this.group.quest.members[this.user._id]);
    },
    onPendingQuest () {
      return Boolean(this.group.quest.key) && !this.group.quest.active;
    },
    onActiveQuest () {
      return this.group.quest.active;
    },
    bossHpPercent () {
      return percent(this.group.quest.progress.hp, this.questData.boss.hp);
    },
    questData () {
      if (!this.group.quest) return {};
      return quests.quests[this.group.quest.key];
    },
    canEditQuest () {
      if (!this.group.quest) return false;
      let isQuestLeader = this.group.quest.leader === this.user._id;
      let isPartyLeader = this.group.leader._id === this.user._id;
      return isQuestLeader || isPartyLeader;
    },
    isMemberOfPendingQuest () {
      let userid = this.user._id;
      let group = this.group;
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] !== false;
    },
    isMemberOfRunningQuest () {
      let userid = this.user._id;
      let group = this.group;
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    },
    acceptedCount () {
      let count = 0;

      if (!this.group || !this.group.quest) return count;

      for (let uuid in this.group.quest.members) {
        if (this.group.quest.members[uuid]) count += 1;
      }

      return count;
    },
  },
  methods: {
    toggle () {
      this.$emit('toggle');
    },
    openStartQuestModal () {
      this.$root.$emit('bv::show::modal', 'start-quest-modal');
    },
    openQuestDetails () {
      this.$root.$emit('bv::show::modal', 'quest-details');
    },
    async questAbort () {
      if (!confirm(this.$t('sureAbort'))) return;
      if (!confirm(this.$t('doubleSureAbort'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/abort'});
      this.group.quest = quest;
    },
    async questLeave () {
      if (!confirm(this.$t('sureLeave'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/leave'});
      this.group.quest = quest;
    },
    async questAccept (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/accept'});
      this.user.party.quest = quest;
    },
    async questReject (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/reject'});
      this.user.party.quest = quest;
    },
  },
};
</script>
