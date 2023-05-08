<template>
  <div>
    <invite-modal
      :group="inviteModalGroup"
      :group-type="inviteModalGroupType"
    />
    <create-party-modal />
    <div
      id="app-header"
      class="row"
      :class="{'hide-header': hideHeader}"
    >
      <members-modal :hide-badge="true" />
      <member-details
        :member="user"
        :class-badge-position="'next-to-name'"
        :is-header="true"
        :disable-name-styling="true"
      />
      <div
        v-if="hasParty"
        class="view-party d-none d-md-flex align-items-center"
      >
        <button
          class="btn btn-primary"
          @click="showPartyMembers()"
        >
          {{ $t('viewParty') }}
        </button>
      </div>
      <div
        v-if="hasParty"
        ref="partyMembersDiv"
        v-resize="1500"
        class="party-members d-none d-md-flex "
        @resized="setPartyMembersWidth($event)"
      >
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <member-details
          v-for="(member, $index) in sortedPartyMembers"
          v-if="member._id !== user._id && $index < membersToShow"
          :key="member._id"
          :member="member"
          condensed="condensed"
          :expanded="member._id === expandedMember"
          :is-header="true"
          :class-badge-position="'hidden'"
          @onHover="expandMember(member._id)"
        />
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      </div>
      <div
        v-else
        class="no-party d-none d-md-flex justify-content-center text-center mr-4"
      >
        <div class="align-self-center">
          <h3>{{ user.party._id ? $t('questWithOthers') : $t('battleWithFriends') }}</h3>
          <span
            class="small-text"
            v-html="user.party._id ? $t('inviteFriendsParty') : $t('startPartyDetail')"
          ></span>
          <br>
          <button
            class="btn btn-primary"
            @click="createOrInviteParty()"
          >
            {{ user.party._id ? $t('findPartyMembers') : $t('getStarted') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  #app-header {
    padding-left: 24px;
    padding-top: 9px;
    padding-bottom: 8px;
    background: $purple-50;
    color: $header-color;
    flex-wrap: nowrap;
    position: relative;
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
</style>

<script>
import orderBy from 'lodash/orderBy';
import * as Analytics from '@/libs/analytics';
import { mapGetters, mapActions } from '@/libs/store';
import MemberDetails from '../memberDetails';
import createPartyModal from '../groups/createPartyModal';
import inviteModal from '../groups/inviteModal';
import membersModal from '../groups/membersModal';
import ResizeDirective from '@/directives/resize.directive';

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
      group: {},
      members: [],
      membersLoaded: false,
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
      return this.user.party && this.user.party._id
        && this.partyMembers && this.partyMembers.length > 1;
    },
    membersToShow () {
      return Math.floor(this.currentWidth / 140) + 1;
    },
    sortedPartyMembers () {
      let sortedMembers = this.partyMembers.slice(); // shallow clone to avoid infinite loop
      const { order, orderAscending } = this.user.party;

      if (order === 'profile.name') {
        // If members are to be sorted by name, use localeCompare for case-
        // insensitive sort
        sortedMembers.sort(
          (a, b) => {
            if (orderAscending === 'desc') {
              return b.profile.name.localeCompare(a.profile.name);
            }

            return a.profile.name.localeCompare(b.profile.name);
          },
        );
      } else {
        sortedMembers = orderBy(
          sortedMembers,
          [order],
          [orderAscending],
        );
      }

      return sortedMembers;
    },
    hideHeader () {
      return ['groupPlan', 'privateMessages'].includes(this.$route.name);
    },
  },
  watch: {
    hideHeader () {
      this.$nextTick(() => {
        if (this.$refs.partyMembersDiv) {
          this.setPartyMembersWidth({ width: this.$refs.partyMembersDiv.clientWidth });
        }
      });
    },
  },
  created () {
    if (this.user.party && this.user.party._id) {
      this.$store.state.memberModalOptions.groupId = this.user.party._id;
      this.getPartyMembers();
    }
  },
  mounted () {
    this.$root.$on('inviteModal::inviteToGroup', group => {
      this.inviteModalGroup = group;
      this.inviteModalGroupType = group.type === 'guild' ? 'Guild' : 'Party';
      this.$root.$emit('bv::show::modal', 'invite-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('inviteModal::inviteToGroup');
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
    async createOrInviteParty () {
      if (this.user.party._id) {
        await Analytics.track({
          eventName: 'Header Party CTA',
          eventAction: 'Header Party CTA',
          eventCategory: 'behavior',
          hitType: 'event',
          state: 'Find Party Members',
        });
        this.$router.push('/looking-for-party');
      } else {
        await Analytics.track({
          eventName: 'Header Party CTA',
          eventAction: 'Header Party CTA',
          eventCategory: 'behavior',
          hitType: 'event',
          state: 'Get Started',
        });
        this.$root.$emit('bv::show::modal', 'create-party-modal');
      }
    },
    loadMembers (payload = null) {
      // Remove unnecessary data
      if (payload && payload.challengeId) {
        delete payload.challengeId;
      }

      return this.$store.dispatch('members:getGroupMembers', payload);
    },
    async showPartyMembers () {
      this.group = await this.$store.dispatch('party:getParty');
      this.group = this.$store.state.party.data;
      this.membersLoaded = true;
      this.members = this.partyMembers;
      this.$store.state.memberModalOptions.loading = false;
      this.$root.$emit('habitica:show-member-modal', {
        groupId: this.group._id,
        group: this.group,
        memberCount: this.group.memberCount,
        viewingMembers: this.members,
        fetchMoreMembers: this.loadMembers,
      });
    },
    setPartyMembersWidth ($event) {
      if (this.currentWidth !== $event.width) {
        this.currentWidth = $event.width;
      }
    },
  },
};
</script>
