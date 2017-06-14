<template lang="pug">
#app-header.row
  member-details(:member="user", @click="$router.push({name: 'avatar'})")
  .party-members.d-flex(v-if="partyMembers && partyMembers.length > 1")
    member-details(
      v-for="member in partyMembers",
      :key="member._id",
      v-if="member._id !== user._id",
      :member="member",
      condensed=true,
      @click="expandMember(member._id)"
      :expanded="member._id === expandedMember",
    )
    button.btn.btn-primary {{ $t('viewParty') }}
  .no-party.d-flex.justify-content-center.text-center(v-else)
    .align-self-center(v-once)
      h3 {{ $t('battleWithFriends') }}
      span.small-text(v-html="$t('inviteFriendsParty')")
      br
      // TODO link to party creation
      button.btn.btn-primary(@click="launchPartyModal()") {{ $t('startAParty') }}

  group-form-modal
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  #app-header {
    padding-left: 14px;
    margin-top: 56px;
    background: $purple-50;
    height: 204px;
    color: $header-color;
    flex-wrap: nowrap;
  }

  .no-party, .party-members {
    flex-grow: 1;
  }

  .party-members {
    overflow-x: auto;
  }

  .no-party {
    .small-text {
      color: $header-color;
    }

    h3 {
      color: $white;
      margin-bottom: 4px;
    }

    button {
      margin-top: 16px;
    }
  }
</style>

<script>
import { mapGetters, mapActions } from 'client/libs/store';
import MemberDetails from './memberDetails';
import groupFormModal from './guilds/groupFormModal'

export default {
  components: {
    MemberDetails,
    groupFormModal,
  },
  data () {
    return {
      expandedMember: null,
    };
  },
  computed: {
    ...mapGetters({
      user: 'user:data',
      partyMembers: 'party:members',
    }),
  },
  methods: {
    ...mapActions({
      getPartyMembers: 'party:getMembers',
    }),
    expandMember (memberId) {
      if (this.expandedMember === memberId) {
        this.expandedMember = null;
      } else {
        this.expandedMember = memberId;
      }
    },
    launchPartyModal () {

      this.$root.$emit('show::modal', 'guild-form');
    },
  },
  created () {
    this.getPartyMembers();
  },
};
</script>
