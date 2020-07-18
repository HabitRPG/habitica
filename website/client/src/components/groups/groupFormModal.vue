<template>
  <b-modal
    id="guild-form"
    :title="title"
    :hide-footer="true"
    size="lg"
  >
    <form @submit.stop.prevent="submit">
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('name') }} *</strong>
        </label>
        <b-form-input
          v-model="workingGroup.name"
          type="text"
          :placeholder="isParty ? $t('newPartyPlaceholder') : $t('newGuildPlaceholder')"
        />
      </div>
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('privacySettings') }}</strong>
        </label>
        <br>
        <div class="custom-control custom-checkbox">
          <input
            id="onlyLeaderCreatesChallenges"
            v-model="workingGroup.onlyLeaderCreatesChallenges"
            class="custom-control-input"
            type="checkbox"
          >
          <label
            v-once
            class="custom-control-label"
            for="onlyLeaderCreatesChallenges"
          >{{ $t('onlyLeaderCreatesChallenges') }}</label>
          <div
            id="groupPrivateDescription1"
            class="icon"
            :title="$t('privateDescription')"
          >
            <div
              class="svg-icon"
              v-html="icons.information"
            ></div>
          </div>
          <b-tooltip
            :title="$t('onlyLeaderCreatesChallengesDetail')"
            target="groupPrivateDescription1"
          />
        </div>
        <!-- br-->
        <!-- @TODO Implement in V2 .custom-control.custom-checkboxinput.custom
        -control-input(type="checkbox", v-model="workingGroup.guildLeaderCantBeMessaged")
label.custom-control-label(v-once) {{ $t('guildLeaderCantBeMessaged') }}
// "guildLeaderCantBeMessaged": "Leader can not be messaged directly",
// @TODO discuss the impact of this with moderators before implementing
        -->
        <br>
        <div
          v-if="!isParty && !workingGroup.id"
          class="custom-control custom-checkbox"
        >
          <input
            id="privateGuild"
            v-model="workingGroup.privateGuild"
            class="custom-control-input"
            type="checkbox"
          >
          <label
            v-once
            class="custom-control-label"
            for="privateGuild"
          >{{ $t('privateGuild') }}</label>
          <div
            id="groupPrivateDescription2"
            class="icon"
            :title="$t('privateDescription')"
          >
            <div
              class="svg-icon"
              v-html="icons.information"
            ></div>
          </div>
          <b-tooltip
            :title="$t('privateDescription')"
            target="groupPrivateDescription2"
          />
        </div>
        <!-- br-->
        <!-- @TODO: Implement in v2 .custom-control.custom-checkbox(v-if='!creatingParty')
        input.custom-control-input(type="checkbox", v-model="workingGroup.allowG
        uildInvitationsFromNonMembers")
label.custom-control-label(v-once) {{ $t('allowGuildInvitationsFromNonMembers') }}
// "allowGuildInvitationsFromNonMembers": "Allow Guild invitations from non-members",
        -->
      </div>
      <div
        v-if="!isParty"
        class="form-group"
      >
        <label>
          <strong v-once>{{ $t('guildSummary') }} *</strong>
        </label>
        <div
          class="summary-count"
        >
          {{ $t('charactersRemaining', {characters: charactersRemaining}) }}
        </div>
        <textarea
          v-model="workingGroup.summary"
          class="form-control summary-textarea"
          :placeholder="isParty ? $t('partyDescriptionPlaceholder') : $t('guildSummaryPlaceholder')"
        ></textarea>
        <!-- @TODO: need summary only for PUBLIC GUILDS, not for tavern, private guilds, or party-->
      </div>
      <div class="form-group">
        <label>
          <strong v-if="isParty">{{ $t('groupDescription') }}</strong>
          <strong v-else>{{ $t('groupDescription') }} *</strong>
        </label>
        <a
          v-markdown="$t('markdownFormattingHelp')"
          class="float-right"
        ></a>
        <textarea
          v-model="workingGroup.description"
          class="form-control description-textarea"
          type="text"
          textarea="textarea"
          :placeholder="isParty
            ? $t('partyDescriptionPlaceholder') : $t('guildDescriptionPlaceholder')"
        ></textarea>
      </div>
      <div
        v-if="creatingParty && !workingGroup.id"
        class="form-group"
      >
        <span>
          <toggleSwitch
            v-model="inviteMembers"
            :label="$t('inviteMembersNow')"
          />
        </span>
      </div>
      <div
        v-if="!creatingParty && !isParty"
        class="form-group"
        style="position: relative;"
      >
        <label>
          <strong v-once>{{ $t('categories') }} *</strong>
        </label>
        <div
          class="category-wrap"
          @click.prevent="toggleCategorySelect"
        >
          <span
            v-if="workingGroup.categories.length === 0"
            class="category-select"
          >{{ $t('none') }}</span>
          <div
            v-for="category in workingGroup.categories"
            :key="category"
            class="category-label"
          >
            {{ $t(categoriesHashByKey[category]) }}
          </div>
        </div>
        <div
          v-if="showCategorySelect"
          class="category-box"
        >
          <!-- eslint-disable vue/no-use-v-if-with-v-for -->
          <div
            v-for="group in categoryOptions"
            v-if="group.key !== 'habitica_official' || user.contributor.admin"
            :key="group.key"
            class="form-check"
          >
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
            <div class="custom-control custom-checkbox">
              <input
                :id="`category-${group.key}`"
                v-model="workingGroup.categories"
                class="custom-control-input"
                type="checkbox"
                :value="group.key"
              >
              <label
                v-once
                class="custom-control-label"
                :for="`category-${group.key}`"
              >{{ $t(group.label) }}</label>
            </div>
          </div>
          <button
            class="btn btn-primary"
            @click.prevent="toggleCategorySelect"
          >
            {{ $t('close') }}
          </button>
        </div>
        <!-- @TODO: need categories only for PUBLIC GUILDS,
         not for tavern, private guilds, or party-->
      </div>
      <div
        v-if="inviteMembers && !workingGroup.id"
        class="form-group"
      >
        <label>
          <strong v-once>Invite via Email or User ID</strong>
          <p v-once>{{ $t('inviteMembersHowTo') }} *</p>
        </label>
        <div>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <div v-for="(member, index) in membersToInvite">
            <input
              v-model="member.value"
              type="text"
            >
            <button @click.prevent="removeMemberToInvite(index)">
              Remove
            </button>
          </div>
          <div>
            <input
              v-model="newMemberToInvite.value"
              type="text"
              placeholder="Email address or User ID"
            >
            <button @click.prevent="addMemberToInvite()">
              Add
            </button>
          </div>
        </div>
      </div>
      <div class="form-group text-center">
        <div
          v-if="!workingGroup.id"
          class="item-with-icon"
        >
          <div
            class="svg-icon"
            v-html="icons.gem"
          ></div>
          <span class="count">4</span>
        </div>
        <button
          v-if="!workingGroup.id"
          class="btn btn-primary btn-md"
          :disabled="!workingGroup.name || !workingGroup.description"
        >
          {{ creatingParty ? $t('createParty') : $t('createGuild') }}
        </button>
        <button
          v-if="workingGroup.id"
          class="btn btn-primary btn-md"
          :disabled="!workingGroup.name || (!isParty && !workingGroup.description)"
        >
          {{ isParty ? $t('updateParty') : $t('updateGuild') }}
        </button>
        <div
          v-if="!workingGroup.id"
          v-once
          class="gem-description"
        >
          {{ $t('guildGemCostInfo') }}
        </div>
      </div>
    </form>
  </b-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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
import { mapState } from '@/libs/store';
import toggleSwitch from '@/components/ui/toggleSwitch';
import markdownDirective from '@/directives/markdown';
import gemIcon from '@/assets/svg/gem.svg';
import informationIcon from '@/assets/svg/information.svg';

import { MAX_SUMMARY_SIZE_FOR_GUILDS } from '@/../../common/script/constants';

// @TODO: Not sure the best way to pass party creating status
// Since we need the modal in the header, passing props doesn't work
// because we can't import the create group in the index of groups
// I think state is the correct spot, but maybe we should separate into
// two modals?

export default {
  components: {
    toggleSwitch,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    const data = {
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

    const hashedCategories = {};
    data.categoryOptions.forEach(category => {
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
    ...mapState({ user: 'user.data' }),
    editingGroup () {
      return this.$store.state.editingGroup;
    },
    charactersRemaining () {
      const currentLength = this.workingGroup.summary ? this.workingGroup.summary.length : 0;
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
  },
  watch: {
    editingGroup () {
      const { editingGroup } = this;

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

      this.workingGroup.leader = editingGroup.leader;

      if (editingGroup._id) this.getMembers();
    },
  },
  methods: {
    async getMembers () {
      if (!this.workingGroup.id) return;
      const members = await this.$store.dispatch('members:getGroupMembers', {
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
        window.alert(this.$t('notEnoughGems'));
        return;
        // @TODO return $rootScope.openModal('buyGems', {track:"Gems > Gems > Create Group"});
      }

      const errors = [];

      if (!this.workingGroup.name) errors.push(this.$t('nameRequired'));
      if (!this.workingGroup.summary) errors.push(this.$t('summaryRequired'));
      if (this.workingGroup.summary.length > MAX_SUMMARY_SIZE_FOR_GUILDS) errors.push(this.$t('summaryTooLong'));
      if (!this.isParty && !this.workingGroup.description) errors.push(this.$t('descriptionRequired'));
      if (!this.isParty && (!this.workingGroup.categories || this.workingGroup.categories.length === 0)) errors.push(this.$t('categoiresRequired'));

      if (errors.length > 0) {
        window.alert(errors.join('\n'));
        return;
      }

      // @TODO: Add proper notifications
      if (!this.workingGroup.id && !window.confirm(this.$t('confirmGuild'))) return;

      if (!this.workingGroup.privateGuild) {
        this.workingGroup.privacy = 'public';
      }

      this.workingGroup.leaderOnly = {
        challenges: this.workingGroup.onlyLeaderCreatesChallenges,
      };

      const categoryKeys = this.workingGroup.categories;
      const serverCategories = [];
      categoryKeys.forEach(key => {
        const catName = this.categoriesHashByKey[key];
        serverCategories.push({
          slug: key,
          name: catName,
        });
      });
      this.workingGroup.categories = serverCategories;

      const groupData = { ...this.workingGroup };

      let newgroup;
      if (groupData.id) {
        await this.$store.dispatch('guilds:update', { group: groupData });
        this.$root.$emit('updatedGroup', this.workingGroup);
        // @TODO: this doesn't work because of the async resource
        // if (updatedGroup.type === 'party') this.$store.state.party = {data: updatedGroup};
      } else {
        newgroup = await this.$store.dispatch('guilds:create', { group: groupData });
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
      };
    },
  },
};
</script>
