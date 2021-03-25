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
    <h2 class="text-center textCondensed" v-once>
      {{ $t('participantsTitle') }} WIP
    </h2>
    <div
      v-for="member in members"
      :key="member._id"
      class="member-row"
    >
      <div class="class-icon"></div>
      <div class="usernames">
        <strong :class="{'declined-name': member.accepted === false}">{{ member.name }}</strong>
      </div>
      <div class="status">
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
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss'>
  #invitation-list {
    .modal-header {
      background-color: #edecee;
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
    background-color: $gray-700;
    display: flex;
    flex-direction: row;
  }

  .class-icon {
    width: 80px;
  }

  .usernames {
    flex: 3;
  }

  .status {
    flex: 1;
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

export default {
  components: {
    CloseIcon,
  },
  props: ['group'],
  computed: {
    ...mapGetters({
      partyMembers: 'party:members',
    }),
    members () {
      const partyMembers = this.partyMembers || [];
      return partyMembers.map(member => ({
        name: member.profile.name,
        accepted: this.group.quest.members[member._id],
        _id: member._id,
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
