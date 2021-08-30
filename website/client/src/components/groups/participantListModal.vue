<template>
  <b-modal
    id="participant-list"
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
      {{ $t('participantsTitle') }}
    </h2>
    <div
      slot="modal-header"
      class="header-wrap"
    >
      <div class="row">
        <div class="col-6">
          <h1 v-once>
            {{ $t('participantsTitle') }}
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
    </div>
    <div
      v-for="member in participants"
      :key="member._id"
      class="member-row"
    >
      <div class="no-padding-left">
        <member-details-new :member="member" />
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss'>
  #participant-list {
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

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-500;
    }
  }

  .member-row {
    ::v-deep {
      .col-4 {
        padding-left: 0;
      }
    }
  }

  #participant-list_modal_body {
    padding: 0;
    max-height: 450px;

    .member-details {
      margin: 0;
    }
  }
</style>

<script>
import { mapGetters } from '@/libs/store';

import MemberDetailsNew from '../memberDetailsNew';
import CloseIcon from '../shared/closeIcon';

export default {
  components: {
    CloseIcon,
    MemberDetailsNew,
  },
  props: ['group'],
  computed: {
    ...mapGetters({
      partyMembers: 'party:members',
    }),
    participants () {
      const partyMembers = this.partyMembers || [];
      const membersAccepted = partyMembers
        .filter(member => this.group.quest.members[member._id] === true);

      return membersAccepted;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'participant-list');
    },
  },
};
</script>
