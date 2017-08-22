<template lang="pug">
  b-modal#guild-form(:title="title", :hide-footer="true", size='lg')
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong(v-once) {{$t('name')}} *
        b-form-input(type="text", :placeholder="$t('newGuildPlaceHolder')", v-model="workingGroup.name")

      .form-group(v-if='workingGroup.id && members.length > 0')
        label
          strong(v-once) {{$t('leader')}} *
        select.form-control(v-model="workingGroup.newLeader")
          option(v-for='member in members', :value="member._id") {{ member.profile.name }}

      .form-group
        label
          strong(v-once) {{$t('privacySettings')}}*
        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="workingGroup.onlyLeaderCreatesChallenges")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('onlyLeaderCreatesChallenges') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')

        // br
        // @TODO Implement in V2 label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="workingGroup.guildLeaderCantBeMessaged")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}

        br
        label.custom-control.custom-checkbox(v-if='!isParty')
          input.custom-control-input(type="checkbox", v-model="workingGroup.privateGuild")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('privateGuild') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')

        // br
        // @TODO: Implement in v2 label.custom-control.custom-checkbox(v-if='!creatingParty')
          input.custom-control-input(type="checkbox", v-model="workingGroup.allowGuildInvationsFromNonMembers")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('allowGuildInvationsFromNonMembers') }}

      .form-group
        label
          strong(v-once) {{$t('description')}} *
        div.description-count {{charactersRemaining}} {{ $t('charactersRemaining') }}
        textarea.form-control(:placeholder="isParty ? $t('partyDescriptionPlaceHolder') : $t('guildDescriptionPlaceHolder')", v-model="workingGroup.description")

      .form-group(v-if='!creatingParty')
        label
          strong(v-once) {{$t('guildInformation')}} *
        textarea.form-control(:placeholder="isParty ? $t('partyInformationPlaceHolder'): $t('guildInformationPlaceHolder')", v-model="workingGroup.guildInformation")

      .form-group(v-if='creatingParty && !workingGroup.id')
        span
          toggleSwitch(:label="$t('inviteMembersNow')", v-model='inviteMembers')

      .form-group(style='position: relative;', v-if='!creatingParty && !isParty')
        label
          strong(v-once) {{$t('categories')}}*
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='workingGroup.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in workingGroup.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value="group.key", v-model="workingGroup.categories")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}

      .form-group(v-if='inviteMembers && !workingGroup.id')
        label
          strong(v-once) Invite via Email or User ID
          p Invite users via a valid email or 36-digit User ID. If an email isn’t registered yet, we’ll invite them to join.

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

  .svg-icon {
    width: 16px;
  }

  textarea {
    height: 150px;
  }

  .description-count, .gem-description {
    font-size: 12px;
    line-height: 1.33;
    text-align: center;
    color: $gray-200;
  }

  .description-count {
    text-align: right;
  }

  .gem-description {
    margin-top: 1em;
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

  .description-count {
    margin-top: 1em;
  }

  .icon {
    margin-left: .5em;
    display: inline-block;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bBtn from 'bootstrap-vue/lib/components/button';
import bFormInput from 'bootstrap-vue/lib/components/form-input';
import bFormCheckbox from 'bootstrap-vue/lib/components/form-checkbox';
import bFormSelect from 'bootstrap-vue/lib/components/form-select';
import bTooltip from 'bootstrap-vue/lib/components/tooltip';

import toggleSwitch from 'client/components/ui/toggleSwitch';
import gemIcon from 'assets/svg/gem.svg';
import informationIcon from 'assets/svg/information.svg';

// @TODO: Not sure the best way to pass party creating status
// Since we need the modal in the header, passing props doesn't work
// because we can't import the create group in the index of groups
// I think state is the correct spot, but maybe we should separate into
// two modals?

export default {
  components: {
    bModal,
    bBtn,
    bFormInput,
    bFormCheckbox,
    bFormSelect,
    bTooltip,
    toggleSwitch,
  },
  data () {
    let data = {
      workingGroup: {
        id: '',
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        guildInformation: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvationsFromNonMembers: true,
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
          label: 'organization',
          key: 'organization',
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
  mounted () {
    // @TODO: do we need this? Maybe us computed. If we need, then make it on show a specific modal
    this.$root.$on('shown::modal', () => {
      let editingGroup = this.$store.state.editingGroup;

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

      if (editingGroup.description) this.workingGroup.description = editingGroup.description;
      if (editingGroup.information) this.workingGroup.information = editingGroup.information;
      if (editingGroup.summary) this.workingGroup.summary = editingGroup.summary;
      if (editingGroup._id) this.workingGroup.id = editingGroup._id;
      if (editingGroup.leader._id) this.workingGroup.newLeader = editingGroup.leader._id;
      if (editingGroup._id) this.getMembers();
    });
  },
  computed: {
    charactersRemaining () {
      return 500 - this.workingGroup.description.length;
    },
    title () {
      if (this.creatingParty) return this.$t('createParty');
      if (!this.workingGroup.id) return this.$t('createGuild');
      if (this.isParty) return this.$t('updateParty');
      return this.$t('updateGuild');
    },
    creatingParty () {
      return this.$store.state.groupFormOptions.createParty;
    },
    isParty () {
      return this.workingGroup.type === 'party';
    },
  },
  methods: {
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
        alert('Not enough gems');
        return;
        // @TODO return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});
      }

      if (!this.workingGroup.name || !this.workingGroup.description) {
        // @TODO: Add proper notifications
        alert('Enter a name and description');
        return;
      }

      if (this.workingGroup.description.length > 500) {
        // @TODO: Add proper notifications
        alert('Description is too long');
        return;
      }

      // @TODO: Add proper notifications
      if (!this.workingGroup.id && !confirm(this.$t('confirmGuild'))) return;

      if (!this.workingGroup.privateGuild) {
        this.workingGroup.privacy = 'public';
      }

      if (!this.workingGroup.onlyLeaderCreatesChallenges) {
        this.workingGroup.leaderOnly = {
          challenges: true,
        };
      }

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

      let newgroup;
      if (this.workingGroup.id) {
        await this.$store.dispatch('guilds:update', {group: this.workingGroup});
        this.$root.$emit('updatedGroup', this.workingGroup);
        // @TODO: this doesn't work because of the async resource
        // if (updatedGroup.type === 'party') this.$store.state.party = {data: updatedGroup};
      } else {
        newgroup = await this.$store.dispatch('guilds:create', {group: this.workingGroup});
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
        allowGuildInvationsFromNonMembers: true,
      };

      if (newgroup && newgroup._id) {
        this.$router.push(`/groups/guild/${newgroup._id}`);
      }
      this.$root.$emit('hide::modal', 'guild-form');
    },
    resetWorkingGroup () {
      this.workingGroup = {
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvationsFromNonMembers: true,
      };
    },
  },
};
</script>
