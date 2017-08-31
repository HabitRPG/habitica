<template lang="pug">
.row(v-if="group")
  group-form-modal(v-if='isParty')
  invite-modal(:group='this.group')
  start-quest-modal(:group='this.group')
  .col-8.standard-page
    .row
      .col-6.title-details
        h1 {{group.name}}
        strong.float-left(v-once) {{$t('groupLeader')}}
        span.float-left(v-once, v-if='group.leader.profile') : {{group.leader.profile.name}}
      .col-6
        .row.icon-row
          .col-4.offset-4(v-bind:class="{ 'offset-8': isParty }")
            .item-with-icon(@click="showMemberModal()")
              .svg-icon.shield(v-html="icons.goldGuildBadgeIcon", v-if='group.memberCount > 1000')
              .svg-icon.shield(v-html="icons.silverGuildBadgeIcon", v-if='group.memberCount > 100 && group.memberCount < 999')
              .svg-icon.shield(v-html="icons.bronzeGuildBadgeIcon", v-if='group.memberCount < 100')
              span.number {{group.memberCount}}
              div(v-once) {{ $t('members') }}
          .col-4(v-if='!isParty')
            .item-with-icon
              .svg-icon.gem(v-html="icons.gem")
              span.number {{group.balance * 4}}
              div(v-once) {{ $t('guildBank') }}
    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}

        textarea(:placeholder="!isParty ? $t('chatPlaceholder') : $t('partyChatPlaceholder')", v-model='newMessage', @keydown='updateCarretPosition')
        autocomplete(:text='newMessage', v-on:select="selectedAutocomplete", :coords='coords', :chat='group.chat')
        button.btn.btn-secondary.send-chat.float-right(v-once, @click='sendMessage()') {{ $t('send') }}
        button.btn.btn-secondary.float-left(v-once, @click='fetchRecentMessages()') {{ $t('fetchRecentMessages') }}
      .col-12
        chat-message(:chat.sync='group.chat', :group-id='group._id', group-name='group.name')

  .col-4.sidebar
    .row(:class='{"guild-background": !isParty}')
      .col-6
      .col-6
        .button-container
          button.btn.btn-success(class='btn-success', v-if='isLeader && !group.purchased.active', @click='upgradeGroup()')
            | {{ $t('upgrade') }}
        .button-container
          button.btn.btn-primary(b-btn, @click="updateGuild", v-once, v-if='isLeader') {{ $t('edit') }}
        .button-container
          button.btn.btn-success(class='btn-success', v-if='!isMember', @click='join()') {{ $t('join') }}
        .button-container
          button.btn.btn-primary(v-once, @click='showInviteModal()') {{$t('invite')}}
        .button-container
          // @TODO: V2 button.btn.btn-primary(v-once, v-if='!isLeader') {{$t('messageGuildLeader')}}
        .button-container
          // @TODO: V2 button.btn.btn-primary(v-once, v-if='isMember && !isParty') {{$t('donateGems')}}

    .section-header(v-if='isParty')
      .row
        .col-10
          h3(v-once) {{ $t('questDetailsTitle') }}
        .col-2
          .toggle-up(@click="sections.quest = !sections.quest", v-if="sections.quest")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.quest = !sections.quest", v-if="!sections.quest")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.quest")
        .row.no-quest-section(v-if='isParty && !onPendingQuest && !onActiveQuest')
          .col-12.text-center
            .svg-icon(v-html="icons.questIcon")
            h4(v-once) {{ $t('youAreNotOnQuest') }}
            p(v-once) {{ $t('questDescription') }}
            button.btn.btn-secondary(v-once, @click="openStartQuestModal()") {{ $t('startAQuest') }}
        .row.quest-active-section(v-if='isParty && onPendingQuest && !onActiveQuest')
          h2 Pending quest
          button.btn.btn-secondary(v-once, @click="questForceStart()") {{ $t('begin') }}
          button.btn.btn-secondary(v-once, @click="questCancel()") {{ $t('cancel') }}
        .row.quest-active-section(v-if='isParty && !onPendingQuest && onActiveQuest')
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
                    .col-6
                      span.float-right {{group.quest.progress.up || 0}} pending damage
            button.btn.btn-secondary(v-once, @click="questAbort()") {{ $t('abort') }}

    .section-header
      .row
        .col-10
          h3(v-once) {{ $t('guildSummary') }}
        .col-2
          .toggle-up(@click="sections.summary = !sections.summary", v-if="sections.summary")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.summary = !sections.summary", v-if="!sections.summary")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.summary")
        p {{ group.summary }}

    .section-header
      .row
        .col-10
          h3 {{ $t('groupDescription') }}
        .col-2
          .toggle-up(@click="sections.description = !sections.description", v-if="sections.description")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.description = !sections.description", v-if="!sections.description")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.description")
        p(v-markdown='group.description')

    .section-header.challenge
      .row
        .col-10.information-header
          h3(v-once)
            | {{ $t('challenges') }}
          b-tooltip.icon.tooltip-wrapper(:content="isParty ? $t('challengeDetails') : $t('privateDescription')")
            .svg-icon(v-html='icons.information')
        .col-2
          .toggle-up(@click="sections.challenges = !sections.challenges", v-if="sections.challenges")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.challenges = !sections.challenges", v-if="!sections.challenges")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.challenges")
        group-challenges(:groupId='searchId')
    div.text-center
      button.btn.btn-primary(class='btn-danger', v-if='isMember', @click='clickLeave()') {{ $t('leave') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  h1 {
    color: $purple-200;
  }

  .button-container {
    margin-bottom: 1em;

    button {
      width: 100%;
    }
  }

  .item-with-icon {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 1em;
    text-align: center;

    .svg-icon.shield, .svg-icon.gem {
      width: 28px;
      margin: 0 auto;
      display: inline-block;
      vertical-align: bottom;
      margin-right: 0.5em;
    }

    .number {
      font-size: 22px;
      font-weight: bold;
    }
  }

  .item-with-icon:hover {
    cursor: pointer;
  }

  .sidebar {
    background-color: $gray-600;
    padding-bottom: 2em;
  }

  .card {
    margin: 2em 0;
    padding: 1em;

    h3.leader {
      color: $purple-200;
    }

    .text {
      font-size: 16px;
      line-height: 1.43;
      color: $gray-50;
    }
  }

  .guild-background {
    background-image: url('~assets/images/groups/grassy-meadow-backdrop.png');
    height: 246px;
  }

  textarea {
    height: 150px;
    width: 100%;
    background-color: $white;
    border: solid 1px $gray-400;
    font-size: 16px;
    line-height: 1.43;
    color: $gray-300;
    padding: .5em;
  }

  textarea::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    font-style: italic;
  }
  textarea::-moz-placeholder { /* Firefox 19+ */
    font-style: italic;
  }
  textarea:-ms-input-placeholder { /* IE 10+ */
    font-style: italic;
  }
  textarea:-moz-placeholder { /* Firefox 18- */
    font-style: italic;
  }

  .title-details {
    padding-top: 1em;
    padding-left: 1em;
  }

  .icon-row {
    margin-top: 1em;

    .number {
      font-size: 22px;
      font-weight: bold;
    }
  }

  .chat-row {
    margin-top: 2em;

    .send-chat {
      margin-top: -3.5em;
      z-index: 10;
      position: relative;
      margin-right: 1em;
    }
  }

  .toggle-up .svg-icon, .toggle-down .svg-icon {
    width: 25px;
  }

  span.action {
    font-size: 14px;
    line-height: 1.33;
    color: $gray-200;
    font-weight: 500;
    margin-right: 1em;
  }

  span.action .icon {
    margin-right: .3em;
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

  .information-header {
    h3, .tooltip-wrapper {
      display: inline-block;
    }

    .tooltip-wrapper {
      width: 15px;
      margin-left: 1.2em;
    }
  }

  .quest-active-section {
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

  .section-header {
    border-top: 1px solid #e1e0e3;
    margin-top: 1em;
    padding-top: 1em;
  }

  .section-header.challenge {
    border-bottom: 1px solid #e1e0e3;
    margin-bottom: 1em;
    padding-bottom: 1em;
  }

  .toggle-up, .toggle-down {
    cursor: pointer;
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

  .grey-progress-bar {
    width: 100%;
    height: 15px;
    background-color: #e1e0e3;
  }

  .collect-progress-bar {
    background-color: #24cc8f;
    height: 15px;

  }
</style>

<script>
import extend from 'lodash/extend';
import groupUtilities from 'client/mixins/groupsUtilities';
import styleHelper from 'client/mixins/styleHelper';
import { mapState } from 'client/libs/store';
import membersModal from './membersModal';
import startQuestModal from './startQuestModal';
import quests from 'common/script/content/quests';
import percent from 'common/script/libs/percent';
import groupFormModal from './groupFormModal';
import inviteModal from './inviteModal';
import chatMessage from '../chat/chatMessages';
import autocomplete from '../chat/autoComplete';
import groupChallenges from '../challenges/groupChallenges';
import markdownDirective from 'client/directives/markdown';

import bCollapse from 'bootstrap-vue/lib/components/collapse';
import bCard from 'bootstrap-vue/lib/components/card';
import bToggle from 'bootstrap-vue/lib/directives/toggle';
import bTooltip from 'bootstrap-vue/lib/components/tooltip';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import gemIcon from 'assets/svg/gem.svg';
import questIcon from 'assets/svg/quest.svg';
import informationIcon from 'assets/svg/information.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge-small.svg';
import silverGuildBadgeIcon from 'assets/svg/silver-guild-badge-small.svg';
import bronzeGuildBadgeIcon from 'assets/svg/bronze-guild-badge-small.svg';

export default {
  mixins: [groupUtilities, styleHelper],
  props: ['groupId'],
  components: {
    membersModal,
    startQuestModal,
    bCollapse,
    bCard,
    bTooltip,
    groupFormModal,
    chatMessage,
    inviteModal,
    groupChallenges,
    autocomplete,
  },
  directives: {
    bToggle,
    markdown: markdownDirective,
  },
  data () {
    return {
      searchId: null,
      group: null,
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        gem: gemIcon,
        liked: likedIcon,
        questIcon,
        information: informationIcon,
        questBackground,
        upIcon,
        downIcon,
        goldGuildBadgeIcon,
        silverGuildBadgeIcon,
        bronzeGuildBadgeIcon,
      }),
      selectedQuest: {},
      sections: {
        quest: true,
        summary: true,
        description: true,
        challenges: true,
      },
      newMessage: '',
      coords: {
        TOP: 0,
        LEFT: 0,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    partyStore () {
      return this.$store.state.party;
    },
    isParty () {
      return this.$route.path.startsWith('/party');
    },
    onPendingQuest () {
      return Boolean(this.group.quest.key) && !this.group.quest.active;
    },
    onActiveQuest () {
      return this.group.quest.active;
    },
    isLeader () {
      return this.user._id === this.group.leader._id;
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.group);
    },
    canEditQuest () {
      let isQuestLeader = this.group.quest && this.group.quest.leader === this.user._id;
      return isQuestLeader;
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
    memberProfileName (memberId) {
      let foundMember = find(this.group.members, function findMember (member) {
        return member._id === memberId;
      });
      return foundMember.profile.name;
    },
    isManager (memberId, group) {
      return Boolean(group.managers[memberId]);
    },
    userCanApprove (userId, group) {
      if (!group) return false;
      let leader = group.leader._id === userId;
      let userIsManager = Boolean(group.managers[userId]);
      return leader || userIsManager;
    },
    hasChallenges () {
      if (!this.group.challenges) return false;
      return this.group.challenges.length === 0;
    },
    bossHpPercent () {
      return percent(this.group.quest.progress.hp, this.questData.boss.hp);
    },
    questData () {
      if (!this.group.quest) return {};
      return quests.quests[this.group.quest.key];
    },
  },
  mounted () {
    this.searchId = this.groupId;
    if (this.isParty) {
      this.searchId = 'party';
      // @TODO: Set up from old client. Decide what we need and what we don't
      // Check Desktop notifs
      // Mark Chat seen
      // Load invites
    }
    this.fetchGuild();

    this.$root.$on('updatedGroup', group => {
      let updatedGroup = extend(this.group, group);
      this.$set(this.group, updatedGroup);
    });
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
    partyStore () {
      if (this.$store.state.party._id) {
        this.group = this.$store.state.party;
      } else {
        this.group = null;
        this.$router.push('/');
      }
    },
  },
  methods: {
    // @TODO: abstract autocomplete
    // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
    getCoord (e, text) {
      let carPos = text.selectionEnd;
      let div = document.createElement('div');
      let span = document.createElement('span');
      let copyStyle = getComputedStyle(text);

      [].forEach.call(copyStyle, (prop) => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      document.body.appendChild(div);
      div.textContent = text.value.substr(0, carPos);
      span.textContent = text.value.substr(carPos) || '.';
      div.appendChild(span);
      this.coords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    updateCarretPosition (eventUpdate) {
      let text = eventUpdate.target;
      this.getCoord(eventUpdate, text);
    },
    selectedAutocomplete (newText) {
      this.newMessage = newText;
    },
    showMemberModal () {
      this.$store.state.memberModalOptions.groupId = this.group._id;
      this.$store.state.memberModalOptions.group = this.group;
      this.$root.$emit('show::modal', 'members-modal');
    },
    async sendMessage () {
      let response = await this.$store.dispatch('chat:postChat', {
        groupId: this.group._id,
        message: this.newMessage,
      });
      this.group.chat.unshift(response.message);
      this.newMessage = '';
    },
    fetchRecentMessages () {
      this.fetchGuild();
    },
    updateGuild () {
      this.$store.state.editingGroup = this.group;
      this.$root.$emit('show::modal', 'guild-form');
    },
    showInviteModal () {
      this.$root.$emit('show::modal', 'invite-modal');
    },
    async fetchGuild () {
      if (this.searchId === 'party' && !this.user.party._id) {
        this.$root.$emit('show::modal', 'create-party-modal');
        return;
      }

      let group = await this.$store.dispatch('guilds:getGroup', {groupId: this.searchId});
      if (this.isParty) {
        this.$store.party = group;
        this.group = this.$store.party;
        this.checkForAchievements();
        return;
      }
      this.group = group;
    },
    deleteAllMessages () {
      if (confirm(this.$t('confirmDeleteAllMessages'))) {
        // User.clearPMs();
      }
    },
    openStartQuestModal () {
      this.$root.$emit('show::modal', 'start-quest-modal');
    },
    checkForAchievements () {
      // Checks if user's party has reached 2 players for the first time.
      if (!this.user.achievements.partyUp && this.group.memberCount >= 2) {
        // @TODO
        // User.set({'achievements.partyUp':true});
        // Achievement.displayAchievement('partyUp');
      }

      // Checks if user's party has reached 4 players for the first time.
      if (!this.user.achievements.partyOn && this.group.memberCount >= 4) {
        // @TODO
        // User.set({'achievements.partyOn':true});
        // Achievement.displayAchievement('partyOn');
      }
    },
    async join () {
      if (this.group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }
      await this.$store.dispatch('guilds:join', {guildId: this.group._id, type: 'myGuilds'});
      this.user.guilds.push(this.group._id);
    },
    clickLeave () {
      // Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Leave Party'});
      // @TODO: Get challenges and ask to keep or remove
      if (!confirm('Are you sure you want to leave?')) return;
      let keep = true;
      this.leave(keep);
    },
    async leave (keepTasks) {
      let keepChallenges = 'remain-in-challenges';

      let data = {
        groupId: this.group._id,
        keep: keepTasks,
        keepChallenges,
      };

      if (this.isParty) data.type = 'party';

      await this.$store.dispatch('guilds:leave', data);

      // @TODO: Implement
      // Analytics.updateUser({'partySize':null,'partyID':null});
      // User.sync().then(function () {
      //  $rootScope.hardRedirect('/#/options/groups/party');
      // });
    },
    upgradeGroup () {
      this.$store.state.upgradingGroup = this.group;
      this.$router.push('/group-plans');
    },
    // @TODO: Move to notificatin component
    async leaveOldPartyAndJoinNewParty () {
      let newPartyName = 'where does this come from';
      if (!confirm(`Are you sure you want to delete your party and join${newPartyName}?`)) return;

      let keepChallenges = 'remain-in-challenges';
      await this.$store.dispatch('guilds:leave', {
        groupId: this.group._id,
        keep: false,
        keepChallenges,
      });

      await this.$store.dispatch('guilds:join', {groupId: this.group._id});
    },
    clickStartQuest () {
      // Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Start a Quest'});
      let hasQuests = find(this.user.items.quests, (quest) => {
        return quest > 0;
      });

      if (hasQuests) {
        this.$root.$emit('show::modal', 'start-quest-modal');
        return;
      }
      // $rootScope.$state.go('options.inventory.quests');
    },
    async questCancel () {
      if (!confirm(this.$t('sureCancel'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/cancel'});
      this.group.quest = quest;
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
    async questAccept () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/accept'});
      this.group.quest = quest;
    },
    async questForceStart () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/force-start'});
      this.group.quest = quest;
    },
    // @TODO: Move to notificaitons component?
    async questReject () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/reject'});
      this.group.quest = quest;
    },
  },
};
</script>
