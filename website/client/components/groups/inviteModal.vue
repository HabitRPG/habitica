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
                button.btn.btn-xs.pull-right(@click='addUuid()')
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
              a.btn.btn-xs.pull-right(@click='addEmail()')
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
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  props: ['group'],
  data () {
    return {
      invitees: [],
      emails: [],
    };
  },
  components: {
    bModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
    inviter () {
      return this.user.profile.name;
    },
    sendInviteText () {
      if (!this.group) return 'Send Invites';
      return this.group.sendInviteText;
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
    // inviteByMethod (inviteMethod) {
      // let invitationDetails;
      //
      // if (inviteMethod === 'email') {
      //   let emails = this.getEmails();
      //   invitationDetails = { inviter: this.inviter, emails };
      // } else if (inviteMethod === 'uuid') {
      //   let uuids = this.getOnlyUuids();
      //   invitationDetails = { uuids };
      // } else {
      //   return alert('Invalid invite method.');
      // }

      // @TODO: Add dispatch
      // Groups.Group.invite(this.group._id, invitationDetails)
      //   .then(function () {
      //      let invitesSent = invitationDetails.emails || invitationDetails.uuids;
      //      let invitationString = invitesSent.length > 1 ? 'invitationsSent' : 'invitationSent';
      //
      //      Notification.text(window.env.t(invitationString));
      //
      //      _resetInvitees();
      //
      //     if (this.group.type === 'party') {
      //       $rootScope.hardRedirect('/#/options/groups/party');
      //     } else {
      //       $rootScope.hardRedirect('/#/options/groups/guilds/' + this.group._id);
      //     }
      //   }, function(){
      //     _resetInvitees();
      //   });
    // },
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
