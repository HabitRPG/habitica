<template>
  <div class="sidebar px-4">
    <div>
      <div class="buttons-wrapper">
        <div class="button-container d-flex">
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
                v-once
                class="svg-icon inline menuIcon"
                v-html="icons.menuIcon"
              >
              </span>
            </template>
            <b-dropdown-item
              v-if="isLeader && !group.purchased.active && group.privacy === 'private'"
              class="selectListItem custom-hover--upgrade"
              @click="$emit('upgradeGroup')"
            >
              <span class="with-icon">
                <span
                  v-once
                  class="svg-icon icon-16 color"
                  v-html="icons.sparklesIcon"
                ></span>
                <span v-once>
                  {{ $t('upgradeToGroup') }}
                </span>
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="!isMember"
              class="selectListItem"
              @click="$emit('showInviteModal')"
            >
              <span class="with-icon">
                <span
                  v-once
                  class="svg-icon icon-16 color"
                  v-html="icons.usersIcon"
                ></span>
                <span v-once>
                  {{ $t(isParty ? 'inviteToParty' : 'inviteToGuild') }}
                </span>
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              class="selectListItem"
              @click="$emit('messageLeader')"
            >
              <span class="with-icon">
                <span
                  v-once
                  class="svg-icon icon-16 color"
                  v-html="icons.messageIcon"
                ></span>
                <span v-once>
                  {{ $t(isParty ? 'messagePartyLeader' : 'messageGuildLeader') }}
                </span>
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="isLeader || isAdmin"
              class="selectListItem"
              @click="$emit('updateGuild')"
            >
              <span class="with-icon">
                <span
                  v-once
                  class="svg-icon icon-16 color"
                  v-html="icons.editIcon"
                ></span>
                <span v-once>
                  {{ isParty ? $t('editParty') : $t('editGuild') }}
                </span>
              </span>
            </b-dropdown-item>
            <b-dropdown-item
              v-if="isMember"
              class="selectListItem custom-hover--leave"
              @click="$emit('leave')"
            >
              <span class="with-icon">
                <span
                  v-once
                  class="svg-icon icon-16 color"
                  v-html="icons.leaveIcon"
                ></span>
                <span v-once>
                  {{ isParty ? $t('leaveParty') : $t('leaveGuild') }}
                </span>
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
        <group-challenges :group="group" />
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
import sparklesIcon from '@/assets/svg/sparklesIcon.svg';
import leaveIcon from '@/assets/svg/leave.svg';
import editIcon from '@/assets/svg/edit.svg';
import messageIcon from '@/assets/svg/message.svg';
import usersIcon from '@/assets/svg/users.svg';

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
        sparklesIcon,
        leaveIcon,
        editIcon,
        messageIcon,
        usersIcon,
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

  .custom-hover--leave {
    --hover-color: #{$maroon-50};
    --hover-background: #ffb6b83F;
  }

  .custom-hover--upgrade {
    --hover-color: #{$green-10};
    --hover-background: #77f4c73F;
  }
</style>
