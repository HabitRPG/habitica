<template lang="pug">
div
  b-modal#select-member-modal(
    size='lg',
    :hideFooter="true",
    @change="onChange($event)"
  )
    .header-wrap(slot="modal-header")
      .row
        .col-6
          h1(v-once) {{$t('selectPartyMember')}}
        .col-6
          button(type="button" aria-label="Close" class="close", @click='close()')
            span(aria-hidden="true") ×
      .row
        .form-group.col-6
          input.form-control.search(type="text", :placeholder="$t('search')", v-model='searchTerm')
        .col-4.offset-2
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', @click='sort(sortOption.value)', :key='sortOption.value') {{sortOption.text}}
    .row(v-for='member in sortedMembers')
      .col-10
        member-details(:member='member')
      .col-2.actions
        button.btn.btn-primary(@click="selectMember(member)") {{ $t('select') }}
    .row.gradient(v-if='members.length > 3')
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
import removeIcon from 'assets/members/remove.svg';
import messageIcon from 'assets/members/message.svg';
import starIcon from 'assets/members/star.svg';

import { mapState } from 'client/libs/store';

export default {
  props: ['group', 'hideBadge', 'item'],
  components: {
    MemberDetails,
  },
  data () {
    return {
      sortOption: '',
      members: [],
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
    ...mapState({user: 'user.data'}),
    sortedMembers () {
      let sortedMembers = this.members;
      if (!this.sortOption) return sortedMembers;

      sortBy(this.members, [(member) => {
        if (this.sortOption === 'tier') {
          if (!member.contributor) return;
          return member.contributor.level;
        } else if (this.sortOption === 'name') {
          return member.profile.name;
        } else if (this.sortOption === 'lvl') {
          return member.stats.lvl;
        } else if (this.sortOption === 'class') {
          return member.stats.class;
        }
      }]);

      return this.members;
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
    async getMembers () {
      let groupId = this.groupId;
      if (groupId && groupId !== 'challenge') {
        let members = await this.$store.dispatch('members:getGroupMembers', {
          groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
      }

      if (this.$store.state.memberModalOptions.viewingMembers.length > 0) {
        this.members = this.$store.state.viewingMembers;
      }

      if (this.members.length === 0 && !this.groupId) {
        this.members = [this.user];
      }
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
