<template>
  <b-modal
    id="invitation-list"
    size="md"
    :hide-header="true"
    :hide-footer="true"
  >
    <div class="dialog-close">
      <close-icon @click="close()" />
    </div>
    <h2
      v-once
      class="text-center textCondensed"
    >
      {{ $t('invitations') }}
    </h2>
    <div
      v-for="member in members"
      :key="member._id"
      class="member-row"
    >
      <div class="class-icon">
        <class-badge
          v-if="member.stats"
          :member-class="member.stats.class"
          :badge-size="40"
        />
      </div>
      <div class="usernames">
        <user-label
          :user="member"
          class="user-label"
        /> <br>
        <span class="username">
          @{{ member.auth.local.username }}
        </span>
      </div>
      <div
        :class="{
          'status': true,
          'accepted': member.accepted === true,
          'declined': member.accepted === false,
          'pending': member.accepted === null
        }"
      >
        <div
          v-if="member.accepted === true"
          class="accepted float-right"
        >
          {{ $t('accepted') }}
        </div>
        <div
          v-if="member.accepted === false"
          class="declined float-right"
        >
          {{ $t('declined') }}
        </div>
        <div
          v-if="member.accepted === null"
          class="pending float-right"
        >
          {{ $t('pending') }}
        </div>
        <div class="circle">
          <div
            v-if="member.accepted === true"
            class="svg-icon color"
            v-html="icons.check"
          ></div>
          <div
            v-if="member.accepted === false"
            class="svg-icon color"
            v-html="icons.close"
          ></div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss'>
  @import '~@/assets/scss/colors.scss';

  #invitation-list {
    .modal-header {
      background-color: $gray-600;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }

    .modal-footer {
      background-color: #edecee;
      border-radius: 0 0 8px 8px;
    }

    .small-text, .character-name {
      color: #878190;
    }

    .no-padding-left {
      padding-left: 0;
    }

    .modal-body {
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 0;
    }

    .member-details {
      margin: 0;
    }

    .modal-content {
      // so that the rounded corners still apply
      overflow: hidden;
    }

    .user-label {
      font-size: 14px;
    }

    .username {
      font-size: 12px;
    }
  }
</style>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  .header-wrap {
    width: 100%;
  }

  h2 {
    color: $purple-300;
    margin-top: 1rem;
  }

  .member-row {
    padding: 0.75rem 1.5rem;

    background-color: $gray-700;
    display: flex;
    flex-direction: row;

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-500;
    }
  }

  .class-icon {
    margin-right: 1rem;
  }

  .usernames {
    flex: 3;
  }

  .status {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .class-icon {
    display: flex;
    align-items: center;
  }

  .circle {
    height: 2rem;
    width: 2rem;

    margin-left: 0.5rem;
    border: 2px solid $gray-300;
    border-radius: 1rem;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .accepted {
    color: $green-10;

    .circle {
      border-color: $green-50;
      background: $green-50;

      color: white;

      .svg-icon {
        height: 10px;
        width: 13px;
      }
    }
  }

  .pending {
    color: $gray-100;
  }

  .declined {
    color: $maroon-10;

    .circle {
      border-color: $maroon-100;
      background: $maroon-100;

      color: white;

      .svg-icon {
        height: 12px;
        width: 12px;

        ::v-deep {
          path {
            stroke: white;
          }
        }
      }
    }
  }

  #invitation-list_modal_body {
    padding: 0;
    max-height: 450px;

    .member-details {
      margin: 0;
    }
  }
</style>

<script>
import { mapGetters } from '@/libs/store';

import CloseIcon from '../shared/closeIcon';
import ClassBadge from '../members/classBadge';
import UserLabel from '../userLabel';

import svgClose from '@/assets/svg/close.svg';
import svgCheck from '@/assets/svg/check.svg';

export default {
  components: {
    UserLabel,
    ClassBadge,
    CloseIcon,
  },
  props: ['group'],
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
        check: svgCheck,
      }),
    };
  },
  computed: {
    ...mapGetters({
      partyMembers: 'party:members',
    }),
    members () {
      const partyMembers = this.partyMembers || [];
      return partyMembers.map(member => ({
        ...member,
        accepted: this.group.quest.members[member._id],
      }));
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'invitation-list');
    },
  },
};
</script>
