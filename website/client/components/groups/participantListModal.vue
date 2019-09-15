<template lang="pug">
  b-modal#participant-list(size='md', :hide-footer='true')
    .header-wrap(slot="modal-header")
      .row
        .col-6
          h1(v-once) {{ $t('participantsTitle') }}
        .col-6
          button(type="button" aria-label="Close" class="close", @click='close()')
            span(aria-hidden="true") ×
    .row(v-for='member in participants')
      .col-12.no-padding-left
        member-details(:member='member')
    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('close') }}
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
    }

    .member-details {
      margin: 0;
    }
  }
</style>

<style lang='scss' scoped>
  .header-wrap {
    width: 100%;
  }

  h1 {
    color: #4f2a93;
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
import { mapGetters } from 'client/libs/store';

import MemberDetails from '../memberDetails';

export default {
  props: ['group'],
  components: {
    MemberDetails,
  },
  computed: {
    ...mapGetters({
      partyMembers: 'party:members',
    }),
    participants () {
      let partyMembers = this.partyMembers || [];
      return partyMembers.filter(member => this.group.quest.members[member._id] === true);
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'participant-list');
    },
  },
};
</script>