<template lang="pug">
#app-header.row
  member-details(:member="user", @click.native="")
  .no-party.d-flex.justify-content-center.text-center(v-if="!user.party._id")
    .align-self-center(v-once)
      h3 {{ $t('battleWithFriends') }}
      span.small-text(v-html="$t('inviteFriendsParty')")
      br
      button.btn.btn-primary {{ $t('startAParty') }}
  .party-members.d-flex(v-else)
    member-details(
      v-for="member in partyMembers",
      :key="member._id",
      :member="member",
      condensed=true,
    )
    member-details(
      v-for="member in partyMembers",
      :key="member._id",
      :member="member",
      condensed=true,
    )
    member-details(
      v-for="member in partyMembers",
      :key="member._id",
      :member="member",
      condensed=true,
    )
    member-details(
      v-for="member in partyMembers",
      :key="member._id",
      :member="member",
      condensed=true,
    )
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

export default {
  components: {
    MemberDetails,
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
  },
  created () {
    this.getPartyMembers();
  },
};
</script>
