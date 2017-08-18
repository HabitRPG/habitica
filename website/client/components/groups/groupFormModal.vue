<template lang="pug">
  b-modal#guild-form(:title="title", :hide-footer="true", size='lg')
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong(v-once) {{$t('name')}}*
        b-form-input(type="text", :placeholder="$t('newGuildPlaceHolder')", v-model="workingGuild.name")

      .form-group(v-if='workingGuild.id && members.length > 0')
        label
          strong(v-once) {{$t('guildLeader')}}*
        select.form-control(v-model="workingGuild.newLeader")
          option(v-for='member in members', :value="member._id") {{ member.profile.name }}

      .form-group
        label
          strong(v-once) {{$t('privacySettings')}}*
        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="workingGuild.onlyLeaderCreatesChallenges")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('onlyLeaderCreatesChallenges') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')

        // br
        // @TODO Implement in V2 label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="workingGuild.guildLeaderCantBeMessaged")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}

        br
        label.custom-control.custom-checkbox(v-if='!creatingParty')
          input.custom-control-input(type="checkbox", v-model="workingGuild.privateGuild")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('privateGuild') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')

        // br
        // @TODO: Implement in v2 label.custom-control.custom-checkbox(v-if='!creatingParty')
          input.custom-control-input(type="checkbox", v-model="workingGuild.allowGuildInvationsFromNonMembers")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('allowGuildInvationsFromNonMembers') }}

      .form-group
        label
          strong(v-once) {{$t('description')}}*
        div.description-count {{charactersRemaining}} {{ $t('charactersRemaining') }}
        textarea.form-control(:placeholder="creatingParty ? $t('partyDescriptionPlaceHolder') : $t('guildDescriptionPlaceHolder')", v-model="workingGuild.description")

      .form-group(v-if='!creatingParty')
        label
          strong(v-once) {{$t('guildInformation')}}*
        textarea.form-control(:placeholder="$t('guildInformationPlaceHolder')", v-model="workingGuild.guildInformation")

      .form-group(v-if='creatingParty && !workingGuild.id')
        span
          toggleSwitch(:label="$t('inviteMembersNow')", v-model='inviteMembers')

      .form-group(style='position: relative;', v-if='!creatingParty')
        label
          strong(v-once) {{$t('categories')}}*
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='workingGuild.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in workingGuild.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value="group.key", v-model="workingGuild.categories")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}

      .form-group(v-if='inviteMembers && !workingGuild.id')
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
        div.item-with-icon(v-if='!creatingParty && !workingGuild.id')
          .svg-icon(v-html="icons.gem")
          span.count 4
        button.btn.btn-primary.btn-md(v-if='!workingGuild.id', :disabled='!workingGuild.name || !workingGuild.description') {{ creatingParty ? $t('createParty') : $t('createGuild') }}
        button.btn.btn-primary.btn-md(v-if='workingGuild.id', :disabled='!workingGuild.name || !workingGuild.description') {{ creatingParty ? $t('updateParty') : $t('updateGuild') }}
        .gem-description(v-once, v-if='!creatingParty && !workingGuild.id') {{ $t('guildGemCostInfo') }}
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
      workingGuild: {
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
      if (!editingGroup._id) return;
      this.workingGuild.name = editingGroup.name;
      this.workingGuild.type = editingGroup.type;
      this.workingGuild.privacy = editingGroup.privacy;
      if (editingGroup.description) this.workingGuild.description = editingGroup.description;
      if (editingGroup.information) this.workingGuild.information = editingGroup.information;
      if (editingGroup.summary) this.workingGuild.summary = editingGroup.summary;
      if (editingGroup._id) this.workingGuild.id = editingGroup._id;
      if (editingGroup.leader._id) this.workingGuild.newLeader = editingGroup.leader._id;
      if (editingGroup._id) this.getMembers();
    });
  },
  computed: {
    charactersRemaining () {
      return 500 - this.workingGuild.description.length;
    },
    title () {
      if (this.creatingParty) return this.$t('createParty');
      if (!this.workingGuild.id) return this.$t('createGuild');
      return this.$t('updateGuild');
    },
    creatingParty () {
      return this.$store.state.groupFormOptions.createParty;
    },
  },
  methods: {
    async getMembers () {
      if (!this.workingGuild.id) return;
      let members = await this.$store.dispatch('members:getGroupMembers', {
        groupId: this.workingGuild.id,
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
      if (this.$store.state.user.data.balance < 1 && !this.workingGuild.id) {
        // @TODO: Add proper notifications
        alert('Not enough gems');
        return;
        // @TODO return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});
      }

      if (!this.workingGuild.name || !this.workingGuild.description) {
        // @TODO: Add proper notifications
        alert('Enter a name and description');
        return;
      }

      if (this.workingGuild.description.length > 500) {
        // @TODO: Add proper notifications
        alert('Description is too long');
        return;
      }

      // @TODO: Add proper notifications
      if (!this.workingGuild.id && !confirm(this.$t('confirmGuild'))) return;

      if (!this.workingGuild.privateGuild) {
        this.workingGuild.privacy = 'public';
      }

      if (!this.workingGuild.onlyLeaderCreatesChallenges) {
        this.workingGuild.leaderOnly = {
          challenges: true,
        };
      }

      let categoryKeys = this.workingGuild.categories;
      let serverCategories = [];
      categoryKeys.forEach(key => {
        let catName = this.categoriesHashByKey[key];
        serverCategories.push({
          slug: key,
          name: catName,
        });
      });
      this.workingGuild.categories = serverCategories;

      let newgroup;
      if (this.workingGuild.id) {
        await this.$store.dispatch('guilds:update', {group: this.workingGuild});
        this.$root.$emit('updatedGroup', this.workingGuild);
        // @TODO: this doesn't work because of the async resource
        // if (updatedGroup.type === 'party') this.$store.state.party = {data: updatedGroup};
      } else {
        newgroup = await this.$store.dispatch('guilds:create', {group: this.workingGuild});
        this.$store.state.user.data.balance -= 1;
      }

      this.$store.state.editingGroup = {};

      this.workingGuild = {
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
  },
};
</script>
