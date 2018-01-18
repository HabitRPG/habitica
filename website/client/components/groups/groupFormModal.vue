<template lang="pug">
  b-modal#guild-form(:title="title", :hide-footer="true", size='lg')
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong(v-once) {{$t('name')}} *
        b-form-input(type="text", :placeholder="$t('newGuildPlaceholder')", v-model="workingGroup.name")
      .form-group(v-if='workingGroup.id && members.length > 0')
        label
          strong(v-once) {{$t('guildOrPartyLeader')}} *
        group-member-search-dropdown(:text="currentLeader", :members='members', :groupId='workingGroup.id', @member-selected='selectNewLeader')
      .form-group
        label
          strong(v-once) {{$t('privacySettings')}} *
        br
        .custom-control.custom-checkbox
          input.custom-control-input#onlyLeaderCreatesChallenges(type="checkbox", v-model="workingGroup.onlyLeaderCreatesChallenges")
          label.custom-control-label(v-once, for="onlyLeaderCreatesChallenges") {{ $t('onlyLeaderCreatesChallenges') }}
          #groupPrivateDescription1.icon(:title="$t('privateDescription')")
            .svg-icon(v-html='icons.information')
          b-tooltip(
            :title="$t('privateDescription')",
            target="groupPrivateDescription1",
          )

        // br
        // @TODO Implement in V2 .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="workingGroup.guildLeaderCantBeMessaged")
          label.custom-control-label(v-once) {{ $t('guildLeaderCantBeMessaged') }}
          // "guildLeaderCantBeMessaged": "Leader can not be messaged directly",
          // @TODO discuss the impact of this with moderators before implementing

        br
        .custom-control.custom-checkbox(v-if='!isParty && !this.workingGroup.id')
          input.custom-control-input#privateGuild(type="checkbox", v-model="workingGroup.privateGuild")
          label.custom-control-label(v-once, for="privateGuild") {{ $t('privateGuild') }}
          #groupPrivateDescription2.icon(:title="$t('privateDescription')")
            .svg-icon(v-html='icons.information')
          b-tooltip(
            :title="$t('privateDescription')",
            target="groupPrivateDescription2",
          )

        // br
        // @TODO: Implement in v2 .custom-control.custom-checkbox(v-if='!creatingParty')
          input.custom-control-input(type="checkbox", v-model="workingGroup.allowGuildInvitationsFromNonMembers")
          label.custom-control-label(v-once) {{ $t('allowGuildInvitationsFromNonMembers') }}
          // "allowGuildInvitationsFromNonMembers": "Allow Guild invitations from non-members",

      .form-group(v-if='!isParty')
        label
          strong(v-once) {{$t('guildSummary')}} *
        div.summary-count {{ $t('charactersRemaining', {characters: charactersRemaining}) }}
        textarea.form-control.summary-textarea(:placeholder="isParty ? $t('partyDescriptionPlaceholder') : $t('guildSummaryPlaceholder')", v-model="workingGroup.summary")
        // @TODO: need summary only for PUBLIC GUILDS, not for tavern, private guilds, or party

      .form-group
        label
          strong(v-once) {{$t('groupDescription')}} *
        a.float-right(v-markdown='$t("markdownFormattingHelp")')
        textarea.form-control.description-textarea(type="text", textarea, :placeholder="isParty ? $t('partyDescriptionPlaceholder') : $t('guildDescriptionPlaceholder')", v-model="workingGroup.description")

      .form-group(v-if='creatingParty && !workingGroup.id')
        span
          toggleSwitch(:label="$t('inviteMembersNow')", v-model='inviteMembers')

      .form-group(style='position: relative;', v-if='!creatingParty && !isParty')
        label
          strong(v-once) {{$t('categories')}} *
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='workingGroup.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in workingGroup.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
            v-if='group.key !== "habitica_official" || user.contributor.admin'
          )
            .custom-control.custom-checkbox
              input.custom-control-input(:id="`category-${group.key}`", type="checkbox", :value="group.key", v-model="workingGroup.categories")
              label.custom-control-label(v-once, :for="`category-${group.key}`") {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}
        // @TODO: need categories only for PUBLIC GUILDS, not for tavern, private guilds, or party

      .form-group(v-if='inviteMembers && !workingGroup.id')
        label
          strong(v-once) Invite via Email or User ID
          p(v-once) {{$t('inviteMembersHowTo')}} *

        div
          div(v-for='(member, index) in membersToInvite')
            input(type='text', v-model='member.value')
            button(@click.prevent='removeMemberToInvite(index)') Remove
          div
            input(type='text', placeholder='Email address or User ID', v-model='newMemberToInvite.value')
            button(@click.prevent='addMemberToInvite()') Add

      .form-group.text-center
        div.item-with-icon(v-if='!this.workingGroup.id')
          .svg-icon(v-html="icons.gem")
          span.count 4
        button.btn.btn-primary.btn-md(v-if='!workingGroup.id', :disabled='!workingGroup.name || !workingGroup.description') {{ creatingParty ? $t('createParty') : $t('createGuild') }}
        button.btn.btn-primary.btn-md(v-if='workingGroup.id', :disabled='!workingGroup.name || !workingGroup.description') {{ isParty ? $t('updateParty') : $t('updateGuild') }}
        .gem-description(v-once, v-if='!this.workingGroup.id') {{ $t('guildGemCostInfo') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .custom-control-input {
    z-index: 1 !important;
  }

  .svg-icon {
    width: 16px;
  }

  textarea {
    height: 150px;
  }

  .summary-count, .gem-description {
    font-size: 12px;
    line-height: 1.33;
    margin-top: 1em;
    color: $gray-200;
  }

  .summary-count {
    text-align: right;
  }

  .gem-description {
    text-align: center;
  }

  .summary-textarea {
    height: 90px;
  }

  .description-textarea {
    height: 220px;
  }

  .item-with-icon {
    display: inline-block;

    img {
      height: 20px;
      margin-right: .5em;
    }

    .count {
      font-size: 14px;
      font-weight: bold;
      margin-right: 1em;
      color: $green-10;
    }
  }

  .icon {
    margin-left: .5em;
    display: inline-block;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import toggleSwitch from 'client/components/ui/toggleSwitch';
import groupMemberSearchDropdown from 'client/components/members/groupMemberSearchDropdown';
import markdownDirective from 'client/directives/markdown';
import gemIcon from 'assets/svg/gem.svg';
import informationIcon from 'assets/svg/information.svg';

import { MAX_SUMMARY_SIZE_FOR_GUILDS } from '../../../common/script/constants';

// @TODO: Not sure the best way to pass party creating status
// Since we need the modal in the header, passing props doesn't work
// because we can't import the create group in the index of groups
// I think state is the correct spot, but maybe we should separate into
// two modals?

export default {
  components: {
    toggleSwitch,
    groupMemberSearchDropdown,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    let data = {
      workingGroup: {
        id: '',
        name: '',
        type: 'guild',
        privacy: 'private',
        summary: '',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvitationsFromNonMembers: true,
        newLeader: '',
      },
      categoryOptions: [
        {
          label: 'habitica_official',
          key: 'habitica_official',
        },
        {
          label: 'academics',
          key: 'academics',
        },
        {
          label: 'advocacy_causes',
          key: 'advocacy_causes',
        },
        {
          label: 'creativity',
          key: 'creativity',
        },
        {
          label: 'entertainment',
          key: 'entertainment',
        },
        {
          label: 'finance',
          key: 'finance',
        },
        {
          label: 'health_fitness',
          key: 'health_fitness',
        },
        {
          label: 'hobbies_occupations',
          key: 'hobbies_occupations',
        },
        {
          label: 'location_based',
          key: 'location_based',
        },
        {
          label: 'mental_health',
          key: 'mental_health',
        },
        {
          label: 'getting_organized',
          key: 'getting_organized',
        },
        {
          label: 'recovery_support_groups',
          key: 'recovery_support_groups',
        },
        {
          label: 'spirituality',
          key: 'spirituality',
        },
        {
          label: 'time_management',
          key: 'time_management',
        },
      ],
      showCategorySelect: false,
      members: [],
      inviteMembers: false,
      newMemberToInvite: {
        value: '',
        type: '',
      },
      membersToInvite: [],
    };

    let hashedCategories = {};
    data.categoryOptions.forEach((category) => {
      hashedCategories[category.key] = category.label;
    });
    data.categoriesHashByKey = hashedCategories;

    data.icons = Object.freeze({
      gem: gemIcon,
      information: informationIcon,
    });

    return data;
  },
  computed: {
    ...mapState({user: 'user.data'}),
    editingGroup () {
      return this.$store.state.editingGroup;
    },
    charactersRemaining () {
      let currentLength = this.workingGroup.summary ? this.workingGroup.summary.length : 0;
      return MAX_SUMMARY_SIZE_FOR_GUILDS - currentLength;
    },
    title () {
      if (this.creatingParty) return this.$t('createParty');
      if (!this.workingGroup._id && !this.workingGroup.id) return this.$t('createGuild');
      if (this.isParty) return this.$t('updateParty');
      return this.$t('updateGuild');
    },
    creatingParty () {
      return this.$store.state.groupFormOptions.createParty;
    },
    isParty () {
      return this.workingGroup.type === 'party';
    },
    currentLeader () {
      const currentLeader = this.members.find(member => {
        return member._id === this.workingGroup.newLeader;
      });
      const currentLeaderName = currentLeader.profile ? currentLeader.profile.name : '';
      return currentLeaderName;
    },
  },
  watch: {
    editingGroup () {
      let editingGroup = this.editingGroup;

      if (!editingGroup._id) {
        this.resetWorkingGroup();
        return;
      }

      this.workingGroup.name = editingGroup.name;
      this.workingGroup.type = editingGroup.type;

      this.workingGroup.privateGuild = true;
      if (editingGroup.privacy === 'public') {
        this.workingGroup.privateGuild = false;
      }

      if (editingGroup.categories) {
        editingGroup.categories.forEach(category => {
          this.workingGroup.categories.push(category.slug);
        });
      }

      if (editingGroup.summary) this.workingGroup.summary = editingGroup.summary;
      if (editingGroup.description) this.workingGroup.description = editingGroup.description;
      if (editingGroup._id) this.workingGroup.id = editingGroup._id;

      this.workingGroup.onlyLeaderCreatesChallenges = editingGroup.leaderOnly.challenges;

      if (editingGroup.leader._id) {
        this.workingGroup.newLeader = editingGroup.leader._id;
        this.workingGroup.currentLeaderId = editingGroup.leader._id;
      }
      if (editingGroup._id) this.getMembers();
    },
  },
  methods: {
    selectNewLeader (member) {
      this.workingGroup.newLeader = member._id;
    },
    async getMembers () {
      if (!this.workingGroup.id) return;
      let members = await this.$store.dispatch('members:getGroupMembers', {
        groupId: this.workingGroup.id,
        includeAllPublicFields: true,
      });
      this.members = members;
    },
    addMemberToInvite () {
      // @TODO: determine type
      this.membersToInvite.push(this.newMemberToInvite);
      this.newMemberToInvite = {
        value: '',
        type: '',
      };
    },
    removeMemberToInvite (index) {
      this.membersToInvite.splice(index, 1);
    },
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
    async submit () {
      if (this.$store.state.user.data.balance < 1 && !this.workingGroup.id) {
        // @TODO: Add proper notifications
        alert(this.$t('notEnoughGems'));
        return;
        // @TODO return $rootScope.openModal('buyGems', {track:"Gems > Gems > Create Group"});
        // @TODO when modal is implemented, enable analytics
        /* Analytics.track({
          hitType: 'event',
          eventCategory: 'button',
          eventAction: 'click',
          eventLabel: 'Health Warning',
        }); */
      }

      let errors = [];

      if (!this.workingGroup.name) errors.push(this.$t('nameRequired'));
      if (!this.workingGroup.summary) errors.push(this.$t('summaryRequired'));
      if (this.workingGroup.summary.length > MAX_SUMMARY_SIZE_FOR_GUILDS) errors.push(this.$t('summaryTooLong'));
      if (!this.workingGroup.description) errors.push(this.$t('descriptionRequired'));
      if (!this.isParty && (!this.workingGroup.categories || this.workingGroup.categories.length === 0)) errors.push(this.$t('categoiresRequired'));

      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      // @TODO: Add proper notifications
      if (!this.workingGroup.id && !confirm(this.$t('confirmGuild'))) return;

      if (!this.workingGroup.privateGuild) {
        this.workingGroup.privacy = 'public';
      }

      this.workingGroup.leaderOnly = {
        challenges: this.workingGroup.onlyLeaderCreatesChallenges,
      };

      let categoryKeys = this.workingGroup.categories;
      let serverCategories = [];
      categoryKeys.forEach(key => {
        let catName = this.categoriesHashByKey[key];
        serverCategories.push({
          slug: key,
          name: catName,
        });
      });
      this.workingGroup.categories = serverCategories;

      let groupData = Object.assign({}, this.workingGroup);
      if (groupData.newLeader === this.workingGroup.currentLeaderId) {
        groupData.leader = this.workingGroup.currentLeaderId;
      }

      let newgroup;
      if (groupData.id) {
        await this.$store.dispatch('guilds:update', {group: groupData});
        this.$root.$emit('updatedGroup', this.workingGroup);
        // @TODO: this doesn't work because of the async resource
        // if (updatedGroup.type === 'party') this.$store.state.party = {data: updatedGroup};
      } else {
        newgroup = await this.$store.dispatch('guilds:create', {group: groupData});
        this.$store.state.user.data.balance -= 1;
      }

      this.$store.state.editingGroup = {};

      this.workingGroup = {
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvitationsFromNonMembers: true,
      };

      if (newgroup && newgroup._id) {
        this.$router.push(`/groups/guild/${newgroup._id}`);
      }
      this.$root.$emit('bv::hide::modal', 'guild-form');
    },
    resetWorkingGroup () {
      this.workingGroup = {
        id: '',
        name: '',
        type: 'guild',
        privacy: 'private',
        summary: '',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvitationsFromNonMembers: true,
        newLeader: '',
      };
    },
  },
};
</script>
