<template>
  <div>
    <b-modal
      id="select-member-modal"
      size="lg"
      :hide-footer="true"
      @change="onChange($event)"
    >
      <div
        slot="modal-header"
        class="header-wrap"
      >
        <div class="row">
          <div class="col-6">
            <h1 v-once>
              {{ $t('selectPartyMember') }}
            </h1>
          </div>
          <div class="col-6">
            <button
              class="close"
              type="button"
              aria-label="Close"
              @click="close()"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
        <div class="row">
          <div class="form-group col-6">
            <input
              v-model="searchTerm"
              class="form-control search"
              type="text"
              :placeholder="$t('search')"
            >
          </div>
          <div class="col-4 offset-2">
            <span class="dropdown-label">{{ $t('sortBy') }}</span>
            <b-dropdown
              :text="$t('sort')"
              right="right"
            >
              <b-dropdown-item
                v-for="sortOption in sortOptions"
                :key="sortOption.value"
                @click="sort(sortOption.value)"
              >
                {{ sortOption.text }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div
        v-for="member in sortedMembers"
        :key="member._id"
        class="row"
      >
        <div class="col-10">
          <member-details :member="member" />
        </div>
        <div class="col-2 actions">
          <button
            class="btn btn-primary"
            @click="selectMember(member)"
          >
            {{ $t('select') }}
          </button>
        </div>
      </div>
      <div
        v-if="members.length > 3"
        class="row gradient"
      ></div>
      <div
        v-if="isLoadMoreAvailable"
        class="row"
      >
        <div class="col-12 text-center">
          <button
            class="btn btn-secondary"
            @click="loadMoreMembers()"
          >
            {{ $t('loadMore') }}
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang='scss'>
  #select-member-modal {
    header {
      background-color: #edecee;
      border-radius: 4px 4px 0 0;
    }

    .header-wrap {
      width: 100%;
    }

    h1 {
      color: #4f2a93;
    }

    h3 {
      color: #4e4a57;
    }

    span {
      color: #878190;
    }

    .actions {
      padding-top: 5em;

      .action-icon {
        margin-right: 1em;
      }
    }

    #select-member-modal_modal_body {
      padding: 0;
      max-height: 450px;

      .col-8 {
        margin-left: 0;
      }

      .member-details {
        margin: 0;
      }

      .member-stats {
        width: 382px;
        height: 147px;
      }

      .gradient {
        background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff);
        height: 50px;
        width: 100%;
        position: absolute;
        bottom: 0px;
        margin-left: -15px;
      }
    }

    .dropdown-icon-item .svg-icon {
      width: 20px;
    }
  }
</style>

<script>
// @TODO: Move this under members directory
import sortBy from 'lodash/sortBy';

import MemberDetails from './memberDetails';
import removeIcon from '@/assets/svg/remove.svg';
import messageIcon from '@/assets/members/message.svg';
import starIcon from '@/assets/members/star.svg';

import { mapState } from '@/libs/store';

export default {
  components: {
    MemberDetails,
  },
  props: ['hideBadge', 'item'],
  data () {
    return {
      sortOption: '',
      members: [],
      group: {},
      invites: [],
      memberToRemove: '',
      sortOptions: [
        {
          value: 'level',
          text: this.$t('tier'),
        },
        {
          value: 'name',
          text: this.$t('name'),
        },
        {
          value: 'lvl',
          text: this.$t('level'),
        },
        {
          value: 'class',
          text: this.$t('class'),
        },
      ],
      searchTerm: '',
      icons: Object.freeze({
        removeIcon,
        messageIcon,
        starIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    sortedMembers () {
      const sortedMembers = this.members;
      if (!this.sortOption) return sortedMembers;

      sortBy(this.members, [member => {
        if (this.sortOption === 'tier') {
          if (!member.contributor) return;
          return member.contributor.level; // eslint-disable-line consistent-return
        } if (this.sortOption === 'name') {
          return member.profile.name; // eslint-disable-line consistent-return
        } if (this.sortOption === 'lvl') {
          return member.stats.lvl; // eslint-disable-line consistent-return
        } if (this.sortOption === 'class') {
          return member.stats.class; // eslint-disable-line consistent-return
        }
      }]);

      return this.members;
    },
    isLoadMoreAvailable () {
      // Only available if the current length of `members` is less than the
      // total size of the Group/Challenge
      return this.members.length < this.$store.state.memberModalOptions.memberCount;
    },
    challengeId () {
      return this.$store.state.memberModalOptions.challengeId;
    },
    groupId () {
      return this.$store.state.groupId || this.group._id;
    },
  },
  watch: {
    item () {
      if (this.item.key) {
        this.getMembers();
      }
    },
  },
  methods: {
    loadMembers (payload = null) {
      // Remove unnecessary data
      if (payload && payload.challengeId) {
        delete payload.challengeId;
      }

      return this.$store.dispatch('members:getGroupMembers', payload);
    },
    async getMembers () {
      this.group = await this.$store.dispatch('party:getParty');
      this.group = this.$store.state.party.data;
      this.$store.state.memberModalOptions.memberCount = this.group.memberCount;
      this.$store.state.memberModalOptions.fetchMoreMembers = this.loadMembers;

      const { groupId } = this;
      if (groupId && groupId !== 'challenge') {
        const members = await this.$store.dispatch('members:getGroupMembers', {
          groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
        const invites = await this.$store.dispatch('members:getGroupInvites', {
          groupId,
          includeAllPublicFields: true,
        });
        this.invites = invites;
      }

      if ((!this.members || this.members.length === 0)
          && this.$store.state.memberModalOptions.viewingMembers.length > 0
      ) {
        this.members = this.$store.state.memberModalOptions.viewingMembers;
      }

      if (!this.members || (this.members.length === 0 && !this.groupId)) {
        this.members = [this.user];
      }
      this.$store.state.memberModalOptions.viewingMembers = this.members;
    },
    async loadMoreMembers () {
      const lastMember = this.members[this.members.length - 1];
      if (!lastMember) return;

      const newMembers = await this.$store.state.memberModalOptions.fetchMoreMembers({
        challengeId: this.challengeId,
        groupId: this.groupId,
        lastMemberId: lastMember._id,
        includeAllPublicFields: true,
      });

      this.members = this.members.concat(newMembers);
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'select-member-modal');
    },
    sort (option) {
      this.sortOption = option;
    },
    selectMember (member) {
      this.$emit('memberSelected', member);
    },
    onChange ($event) {
      this.$emit('change', $event);
    },
  },
};
</script>
