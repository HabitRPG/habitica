<template>
  <div class="sidebar">
    <div
      class="px-3"
      :class="{'guild-background': !isParty}"
    >
      <div class="buttons-wrapper">
        <div class="button-container">
          <button
            v-if="isLeader && !group.purchased.active && group.privacy === 'private'"
            class="btn btn-success btn-success"
            @click="$emit('upgradeGroup')"
          >
            {{ $t('upgrade') }}
          </button>
        </div>
        <div class="button-container" v-if="!isParty">
          <button
            v-if="isLeader || isAdmin"
            v-once
            class="btn btn-primary"
            @click="$emit('updateGuild')"
          >
            {{ $t('edit') }}
          </button>
        </div>
        <div class="button-container">
          <button
            v-if="!isMember"
            class="btn btn-success btn-success"
            @click="$emit('join')"
          >
            {{ $t('join') }}
          </button>
        </div>
        <div v-if="isParty"
             class="button-container party-invite-row">
          <button
            v-once
            class="btn btn-primary inline"
            @click="$emit('showInviteModal')"
          >
            {{ $t('invite') }}
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
                v-if="isLeader || isAdmin"
                @click="$emit('updateGuild')">
              <span v-once>
                {{ $t('edit') }}
              </span>
            </b-dropdown-item>
            <b-dropdown-item
                v-if="isMember"
                @click="$emit('leave')">
              <span v-once>
                {{ isParty ? $t('leaveParty') : $t('leaveGroup') }}
              </span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
        <div class="button-container" v-if="!isParty">
          <button
            v-once
            class="btn btn-primary"
            @click="$emit('showInviteModal')"
          >
            {{ $t('invite') }}
          </button>
          <!-- @TODO: hide the invitation button
            if there's an active group plan and the player is not the leader-->
        </div>
        <div class="button-container">
          <!-- @TODO: V2 button.btn.btn-primary(v-once, v-if='!isLeader')
           {{$t('messageGuildLeader')}} // Suggest making the button
            visible to the leader too - useful for them to test how
             the feature works or to send a note to themself. -- Alys-->
        </div>
        <div class="button-container">
          <!-- @TODO: V2 button.btn.btn-primary(v-once,
            v-if='isMember && !isParty') {{$t('donateGems')}}
            // Suggest removing the isMember restriction
             - it's okay if non-members donate to a public
             guild. Also probably allow it for parties
             if parties can buy imagery. -- Alys-->
        </div>
      </div>
    </div>
    <div class="px-3 py-3">
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
        :tooltip="$t('challengeDetails')"
      >
        <group-challenges :group-id="searchId" />
      </sidebar-section>
    </div>
    <div class="text-center" v-if="!isParty">
      <button
        v-if="isMember"
        class="btn btn-danger"
        @click="$emit('leave')"
      >
        {{ isParty ? $t('leaveParty') : $t('leaveGroup') }}
      </button>
    </div>
    {{ group }}
    Leader: {{ isLeader }}
    IsAdmin: {{ isAdmin }}
    IsMember: {{ isMember }}
    SearchId {{ searchId }}
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
    margin-bottom: 1em;

    button {
      width: 100%;
    }
  }

  .guild-background {
    background-image: url('~@/assets/images/groups/grassy-meadow-backdrop.png');
    height: 246px;
  }

  .party-invite-row {
    display: flex;
  }

  .menuIcon {
    width: 4px;
    height: 1rem;
    object-fit: contain;
  }
</style>
