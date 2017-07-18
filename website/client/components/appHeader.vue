<template lang="pug">
#app-header.row
  member-details(:member="user", @click="$router.push({name: 'avatar'})")
  .view-party(v-if="user.party && user.party._id")
    // TODO button should open the party members modal
    router-link.btn.btn-primary(:active-class="''", :to="{name: 'party'}") {{ $t('viewParty') }}
  .party-members.d-flex(v-if="partyMembers && partyMembers.length > 1")
    member-details(
      v-for="(member, $index) in partyMembers",
      :key="member._id",
      v-if="member._id !== user._id && $index < 10",
      :member="member",
      condensed=true,
      @onHover="expandMember(member._id)",
      :expanded="member._id === expandedMember",
    )
  .no-party.d-flex.justify-content-center.text-center(v-else)
    .align-self-center(v-once)
      h3 {{ $t('battleWithFriends') }}
      span.small-text(v-html="$t('inviteFriendsParty')")
      br
      // TODO link to party creation or party page if partying solo
      router-link.btn.btn-primary(:active-class="''", :to="{name: 'party'}") {{ $t('startAParty') }}
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
  position: relative;
}

.no-party, .party-members {
  flex-grow: 1;
}

.party-members {
}

.view-party {
  position: absolute;
  z-index: 10;
  right: 0;
  padding-right: 40px;
  height: 100%;
  background-image: linear-gradient(to right, rgba($purple-50, 0), $purple-50);

  .btn {
    margin-top: 75%;
  }
}

.no-party {
  .small-text {
    color: $header-color;
    flex-wrap: nowrap;
  }

  h3 {
    color: $white;
    margin-bottom: 4px;
  }

  .btn {
    margin-top: 16px;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'client/libs/store';
import MemberDetails from './memberDetails';
import createPartyModal from './guilds/createPartyModal';

export default {
  components: {
    MemberDetails,
    createPartyModal,
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
  },
  created () {
    if (this.user.party && this.user.party._id) this.getPartyMembers();
  },
};
</script>
