<template>
  <div class="sidebar px-4">
    <div
      :class="{'group-background': isGroup}"
    >
      <div class="buttons-wrapper">
        <div class="button-container button-with-menu-row">
          <button
            v-if="!isMember"
            class="btn btn-success btn-success"
            @click="$emit('join')"
          >
            <span v-once>{{ $t(isParty ? 'joinParty' : 'joinGuild') }}</span>
          </button>
          <button
            v-if="isMember"
            class="btn btn-primary inline"
            @click="$emit('showInviteModal')"
          >
            <span v-once>{{ $t(isParty ? 'inviteToParty' : 'inviteToGuild') }}</span>
          </button>
          <b-dropdown
            right="right"
            toggle-class="with-icon"
            class="ml-2"
            :no-caret="true"
          >
            <template v-slot:button-content>
              <span
                class="svg-icon inline menuIcon"
                v-html="icons.menuIcon"
              >
              </span>
            </template>
            <b-dropdown-item
              v-if="isLeader && !group.purchased.active && group.privacy === 'private'"
              class="selectListItem"
              @click="$emit('upgradeGroup')"
            >
              <span v-once>
                {{ $t('upgradeToGroup') }}
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="!isMember"
              class="selectListItem"
              @click="$emit('showInviteModal')"
            >
              <span v-once>{{ $t(isParty ? 'inviteToParty' : 'inviteToGuild') }}</span>
            </b-dropdown-item>
            <b-dropdown-item
              class="selectListItem"
              @click="$emit('messageLeader')"
            >
              <span v-once>
                {{ $t(isParty ? 'messagePartyLeader' : 'messageGuildLeader') }}
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="isLeader || isAdmin"
              class="selectListItem"
              @click="$emit('updateGuild')"
            >
              <span v-once>
                {{ isParty ? $t('editParty') : $t('editGuild') }}
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="isMember"
              class="selectListItem"
              @click="$emit('leave')"
            >
              <span v-once>
                {{ isParty ? $t('leaveParty') : $t('leaveGuild') }}
              </span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div>
      <quest-sidebar-section
        v-if="isParty"
        :group="group"
      />
      <sidebar-section
        v-if="!isParty"
        :title="$t('guildSummary')"
      >
        <p v-markdown="group.summary"></p>
      </sidebar-section>
      <sidebar-section :title="$t('groupDescription')">
        <p v-markdown="group.description"></p>
      </sidebar-section>
      <sidebar-section
        :title="$t('challenges')"
      >
        <group-challenges :group-id="searchId" />
      </sidebar-section>
    </div>
  </div>
</template>

<script>
import groupChallenges from '@/components/challenges/groupChallenges';
import questSidebarSection from '@/components/groups/questSidebarSection';
import sidebarSection from '@/components/sidebarSection';
import markdownDirective from '@/directives/markdown';

import menuIcon from '@/assets/svg/menu.svg';

export default {
  components: {
    groupChallenges,
    questSidebarSection,
    sidebarSection,
  },
  directives: {
    markdown: markdownDirective,
  },
  props: ['isParty', 'isLeader', 'isAdmin', 'isMember', 'searchId', 'group'],
  data () {
    return {
      icons: Object.freeze({
        menuIcon,
      }),
    };
  },
  computed: {
    isGroup () {
      return Boolean(this.group.purchased?.plan?.customerId);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  @media (min-width: 1300px) {
    .sidebar {
      max-width: 430px !important;
    }
  }

  .sidebar {
    background-color: $gray-600;
    padding-bottom: 2em;
    padding-top: 1.5rem;
  }

  .button-container {
    margin-bottom: 1.5em;

    button {
      width: 100%;
    }
  }

  .group-background {
    background-image: url('~@/assets/images/groups/grassy-meadow-backdrop.png');
    height: 246px;
  }

  .button-with-menu-row {
    display: flex;
  }

  .menuIcon {
    width: 4px;
    height: 1rem;
    object-fit: contain;
  }

  .dropdown-link {
    text-decoration: none;
  }

  .divider {
    width: calc(100% + 3rem);
    height: 0.063rem;
    margin-top: 1.5rem;
    margin-right: -1.5rem;
    margin-left: -1.5rem;
    margin-bottom: 0.688rem;
    background-color: $gray-500;
  }
</style>
