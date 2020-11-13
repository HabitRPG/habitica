<template>
  <div class="sidebar">
    <div
      class="row"
      :class="{'guild-background': !isParty}"
    >
      <div class="col-12 buttons-wrapper">
        <div class="button-container">
          <button
            v-if="isLeader && !group.purchased.active && group.privacy === 'private'"
            class="btn btn-success btn-success"
            @click="$emit('upgradeGroup')"
          >
            {{ $t('upgrade') }}
          </button>
        </div>
        <div class="button-container">
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
            @click="join()"
          >
            {{ $t('join') }}
          </button>
        </div>
        <div class="button-container">
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
    <div class="text-center">
      <button
        v-if="isMember"
        class="btn btn-danger"
        @click="$emit('leave')"
      >
        {{ isParty ? $t('leaveParty') : $t('leaveGroup') }}
      </button>
    </div>
    {{ group }}
  </div>
</template>

<script>
import groupChallenges from '@/components/challenges/groupChallenges';
import questSidebarSection from '@/components/groups/questSidebarSection';
import sidebarSection from '@/components/sidebarSection';
import markdownDirective from '@/directives/markdown';

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
</style>
