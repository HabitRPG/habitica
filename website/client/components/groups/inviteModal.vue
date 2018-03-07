<template lang="pug">
b-modal#invite-modal(:title="$t('inviteFriends')", size='lg')
  .modal-body
    p.alert.alert-info(v-html="$t('inviteAlertInfo')")
    .form-horizontal
      table.table.table-striped
        thead
          tr
            th {{ $t('userId') }}
        tbody
          tr(v-for='user in invitees')
            td
              input.form-control(type='text', v-model='user.uuid')
            tr
              td
                button.btn.btn-primary.pull-right(@click='addUuid()')
                  i.glyphicon.glyphicon-plus
                  | +
          tr
            td
              .col-6.col-offset-6
                button.btn.btn-primary.btn-block(@click='inviteNewUsers("uuid")') {{sendInviteText}}
    hr
    p.alert.alert-info {{ $t('inviteByEmail') }}
    .form-horizontal
      table.table.table-striped
        thead
          tr
            th {{ $t('name') }}
            th {{ $t('email') }}
        tbody
          tr(v-for='email in emails')
            td
              input.form-control(type='text', v-model='email.name')
            td
              input.form-control(type='email', v-model='email.email')
          tr
            td(colspan=2)
              button.btn.btn-primary.pull-right(@click='addEmail()')
                i.glyphicon.glyphicon-plus
                | +
          tr
            td.form-group(colspan=2)
              label.col-sm-1.control-label {{ $t('byColon') }}
              .col-sm-5
                input.form-control(type='text', v-model='inviter')
              .col-sm-6
                button.btn.btn-primary.btn-block(@click='inviteNewUsers("email")') {{sendInviteText}}
</template>

<script>
import { mapState } from 'client/libs/store';

import filter from 'lodash/filter';
import map from 'lodash/map';
import notifications from 'client/mixins/notifications';
import * as Analytics from 'client/libs/analytics';

export default {
  mixins: [notifications],
  props: ['group'],
  data () {
    return {
      invitees: [],
      emails: [],
    };
  },
  mounted () {
    Analytics.track({
      hitType: 'event',
      eventCategory: 'button',
      eventAction: 'click',
      eventLabel: 'Invite Friends',
    });
  },
  computed: {
    ...mapState({user: 'user.data'}),
    inviter () {
      return this.user.profile.name;
    },
    sendInviteText () {
      return 'Send Invites';
      // if (!this.group) return 'Send Invites';
      // return this.group.sendInviteText;
    },
  },
  methods: {
    addUuid () {
      this.invitees.push({uuid: ''});
    },
    addEmail () {
      this.emails.push({name: '', email: ''});
    },
    inviteNewUsers (inviteMethod) {
      if (!this.group._id) {
        if (!this.group.name) this.group.name = this.$t('possessiveParty', {name: this.user.profile.name});

        // @TODO: Add dispatch
        // return Groups.Group.create(this.group)
        //   .then(function(response) {
        //     this.group = response.data.data;
        //     _inviteByMethod(inviteMethod);
        //   });
      }

      this.inviteByMethod(inviteMethod);
    },
    async inviteByMethod (inviteMethod) {
      let invitationDetails;

      if (inviteMethod === 'email') {
        let emails = this.getEmails();
        invitationDetails = { inviter: this.inviter, emails };
      } else if (inviteMethod === 'uuid') {
        let uuids = this.getOnlyUuids();
        invitationDetails = { uuids };
      } else {
        return alert('Invalid invite method.');
      }

      await this.$store.dispatch('guilds:invite', {
        invitationDetails,
        groupId: this.group._id,
      });

      let invitesSent = invitationDetails.emails || invitationDetails.uuids;
      let invitationString = invitesSent.length > 1 ? 'invitationsSent' : 'invitationSent';

      this.text(this.$t(invitationString));

      this.invitees = [];
      this.emails = [];

      // @TODO: This function didn't make it over this.resetInvitees();

      // @TODO: Sync group invites?
      // if (this.group.type === 'party') {
      //   this.$router.push('//party');
      // } else {
      //   this.$router.push(`/groups/guilds/${this.group._id}`);
      // }
      this.$root.$emit('bv::hide::modal', 'invite-modal');
      // @TODO: error?
      // _resetInvitees();
    },
    getOnlyUuids () {
      let uuids = map(this.invitees, 'uuid');
      let filteredUuids = filter(uuids, (id) => {
        return id !== '';
      });
      return filteredUuids;
    },
    getEmails () {
      let emails = filter(this.emails, (obj) => {
        return obj.email !== '';
      });
      return emails;
    },
  },
};
</script>
