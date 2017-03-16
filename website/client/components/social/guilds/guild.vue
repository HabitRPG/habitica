<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
.row(v-if="guild")
  .clearfix.col-12 
    .float-left
      h2 {{guild.name}}
      strong.float-left {{$t('groupLeader')}}
      span.float-left : {{guild.leader.profile.name}}
    .float-right
      .clearfix
        h3.float-left
          span.badge.badge-default {{guild.memberCount}}
          |  {{$t('members')}}
        button.btn.float-left(:class="[isMember ? 'btn-danger' : 'btn-success']") {{ isMember ? $t('leave') : $t('join') }}
  .col-5
    h4(v-once) {{ $t('description') }}
    p {{ guild.description }}
  .col-7
    h4(v-once) {{ $t('chat') }}
    .card(v-for="msg in guild.chat", :key="msg.id") 
      .card-block
        .clearfix
          strong.float-left {{msg.user}}
          .float-right {{msg.timestamp}}
        .text {{msg.text}}
</template>

<style lang="scss" scoped>
.card {
  margin-bottom: 1rem;
}

</style>
<script>
import axios from 'axios';
import groupUtilities from '../../../mixins/groupsUtilities';
import { mapState } from '../../../store';

export default {
  mixins: [groupUtilities],
  props: ['guildId'],
  data () {
    return {
      guild: null,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  created () {
    this.fetchGuild();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
  },
  methods: {
    fetchGuild () {
      axios.get(`/api/v3/groups/${this.guildId}`).then(response => {
        this.guild = response.data.data;
      });
    },
  },
};
</script>
