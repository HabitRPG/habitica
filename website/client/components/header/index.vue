<template lang="pug">
div
  create-party-modal
  #app-header.row(:class="{'hide-header': $route.name === 'groupPlan'}")
    members-modal(:hide-badge="true")
    member-details(
      :member="user",
      :class-badge-position="'next-to-name'",
      :is-header="true",
    )
    .view-party.d-flex.align-items-center(
      v-if="user.party && user.party._id && partyMembers && partyMembers.length > 1",
    )
      button.btn.btn-primary.view-party-button(@click='openPartyModal()') {{ $t('viewParty') }}
    .party-members.d-flex(
      v-if="partyMembers && partyMembers.length > 1",
      v-resize="1500",
      @resized="setPartyMembersWidth($event)"
    )
      member-details(
        v-for="(member, $index) in partyMembers",
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
      .align-self-center(v-once)
        h3 {{ $t('battleWithFriends') }}
        span.small-text(v-html="$t('inviteFriendsParty')")
        br
        button.btn.btn-primary(@click='openPartyModal()') {{ partyMembers && partyMembers.length > 1 ? $t('startAParty') : $t('inviteFriends') }}
  a.useMobileApp(v-if="isAndroidMobile()", v-once, href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica") {{ $t('useMobileApps') }}
  a.useMobileApp(v-if="isIOSMobile()", v-once, href="https://itunes.apple.com/us/app/habitica-gamified-task-manager/id994882113?mt=8") {{ $t('useMobileApps') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .useMobileApp {
    background: red;
    color: white;
    z-index: 10;
    width: 100%;
    margin: 10px 5px 0 0;
    height: 64px;
    text-align: center;

    display: flex;
    align-items: center;
  }

  #app-header {
    margin-top: 56px;
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

  @media only screen and (max-width: 768px) {
    .view-party-button {
      display: none;
    }
  }
</style>

<script>
import { mapGetters, mapActions } from 'client/libs/store';
import MemberDetails from '../memberDetails';
import createPartyModal from '../groups/createPartyModal';
import membersModal from '../groups/membersModal';
import ResizeDirective from 'client/directives/resize.directive';

export default {
  directives: {
    resize: ResizeDirective,
  },
  components: {
    MemberDetails,
    createPartyModal,
    membersModal,
  },
  data () {
    return {
      expandedMember: null,
      currentWidth: 0,
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
    membersToShow () {
      return Math.floor(this.currentWidth / 140) + 1;
    },
  },
  methods: {
    ...mapActions({
      getPartyMembers: 'party:getMembers',
    }),
    isAndroidMobile () {
      return navigator.userAgent.match(/Android/i);
    },
    isIOSMobile () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    expandMember (memberId) {
      if (this.expandedMember === memberId) {
        this.expandedMember = null;
      } else {
        this.expandedMember = memberId;
      }
    },
    openPartyModal () {
      if (this.user.party._id) {
        this.$store.state.memberModalOptions.groupId = this.user.party._id;
        // @TODO: do we need to fetch party?
        // this.$store.state.memberModalOptions.group = this.$store.state.party;
        this.$root.$emit('bv::show::modal', 'members-modal');
        return;
      }
      this.$root.$emit('bv::show::modal', 'create-party-modal');
    },
    setPartyMembersWidth ($event) {
      if (this.currentWidth !== $event.width) {
        this.currentWidth = $event.width;
      }
    },
  },
  async created () {
    if (this.user.party && this.user.party._id) {
      await this.getPartyMembers(true);
    }
  },
};
</script>
