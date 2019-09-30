<template lang="pug">
div
  invite-modal(:group='inviteModalGroup', :groupType='inviteModalGroupType')
  create-party-modal
  #app-header.row(:class="{'hide-header': $route.name === 'groupPlan'}")
    members-modal(:hide-badge="true")
    member-details(
      :member="user",
      :class-badge-position="'next-to-name'",
      :is-header="true",
    )
    .view-party.d-flex.align-items-center(
      v-if="hasParty",
    )
      button.btn.btn-primary.view-party-button(@click='showPartyMembers()') {{ $t('viewParty') }}
    .party-members.d-flex(
      v-if="hasParty",
      v-resize="1500",
      @resized="setPartyMembersWidth($event)"
    )
      member-details(
        v-for="(member, $index) in sortedPartyMembers",
        :key="member._id",
        v-if="member._id !== user._id && $index < membersToShow",
        :member="member",
        condensed=true,
        @onHover="expandMember(member._id)",
        :expanded="member._id === expandedMember",
        :is-header="true",
        :class-badge-position="'hidden'",
      )
    .no-party.d-flex.justify-content-center.text-center(v-else)
      .align-self-center
        h3 {{ $t('battleWithFriends') }}
        span.small-text(v-html="$t('inviteFriendsParty')")
        br
        button.btn.btn-primary(@click='createOrInviteParty()') {{ user.party._id ? $t('inviteFriends') : $t('startAParty') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  #app-header {
    padding-left: 24px;
    padding-top: 9px;
    padding-bottom: 8px;
    background: $purple-50;
    color: $header-color;
    flex-wrap: nowrap;
    position: relative;
    max-height: 10.25rem;
  }

  .hide-header {
    display: none;
  }

  .no-party, .party-members {
    flex-grow: 1;
  }

  .view-party {
    position: absolute;
    z-index: 10;
    right: 0;
    padding-right: 40px;
    padding-left: 10px;
    height: calc(100% - 9px);
    background-image: linear-gradient(to right, rgba($purple-50, 0), $purple-50);
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

  @media only screen and (max-width: 768px) {
    .view-party-button {
      display: none;
    }
  }
</style>

<script>
import orderBy from 'lodash/orderBy';
import { mapGetters, mapActions } from 'client/libs/store';
import MemberDetails from '../memberDetails';
import createPartyModal from '../groups/createPartyModal';
import inviteModal from '../groups/inviteModal';
import membersModal from '../groups/membersModal';
import ResizeDirective from 'client/directives/resize.directive';

export default {
  directives: {
    resize: ResizeDirective,
  },
  components: {
    MemberDetails,
    createPartyModal,
    inviteModal,
    membersModal,
  },
  data () {
    return {
      expandedMember: null,
      currentWidth: 0,
      inviteModalGroup: undefined,
      inviteModalGroupType: undefined,
    };
  },
  computed: {
    ...mapGetters({
      user: 'user:data',
      partyMembers: 'party:members',
    }),
    showHeader () {
      if (this.$store.state.hideHeader) return false;
      return true;
    },
    hasParty () {
      return this.user.party && this.user.party._id && this.partyMembers && this.partyMembers.length > 1;
    },
    membersToShow () {
      return Math.floor(this.currentWidth / 140) + 1;
    },
    sortedPartyMembers () {
      return orderBy(this.partyMembers, [this.user.party.order], [this.user.party.orderAscending]);
    },
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
    createOrInviteParty () {
      if (this.user.party._id) {
        this.$root.$emit('inviteModal::inviteToGroup', this.user.party);
      } else {
        this.$root.$emit('bv::show::modal', 'create-party-modal');
      }
    },
    async showPartyMembers () {
      const party = await this.$store.dispatch('party:getParty');

      this.$root.$emit('habitica:show-member-modal', {
        groupId: party.data._id,
        viewingMembers: this.partyMembers,
        group: party.data,
      });
    },
    setPartyMembersWidth ($event) {
      if (this.currentWidth !== $event.width) {
        this.currentWidth = $event.width;
      }
    },
  },
  created () {
    if (this.user.party && this.user.party._id) {
      this.$store.state.memberModalOptions.groupId = this.user.party._id;
      this.getPartyMembers();
    }
  },
  mounted () {
    this.$root.$on('inviteModal::inviteToGroup', (group) => {
      this.inviteModalGroup = group;
      this.inviteModalGroupType = group.type === 'guild' ? 'Guild' : 'Party';
      this.$root.$emit('bv::show::modal', 'invite-modal');
    });
  },
  destroyed () {
    this.$root.off('inviteModal::inviteToGroup');
  },
};
</script>
