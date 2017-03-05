<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
div(v-if="guild")
  .ui.grid
    .row
      .eight.wide.column.left.floated
        h2.ui.header.sixteen.wide.column {{guild.name}}
        .sixteen.wide.column
          h4.ui.left.floated.header {{$t('groupLeader')}}
          p {{guild.leader.profile.name}}
      .eight.wide.column.right.floated
        .ui.basic.segment.right.floated
          // TODO extract button to component?
          .ui.button(:class="[isMember ? 'red' : 'green']") {{ isMember ? $t('leave') : $t('join') }}
        .ui.segment.compact.right.floated
          h3.ui.header.centered
            | {{guild.memberCount}}
            .sub.header(v-once) {{ $t('members') }}
    .row
      .five.wide.column
        h3.ui.header(v-once) {{ $t('description') }}
        p {{ guild.description }}
      .eleven.wide.column
        h3.ui.header(v-once) {{ $t('chat') }}
        .ui.minimal.comments
          .comment(v-for="msg in guild.chat", :key="msg.id") 
            .content
              a.author {{msg.user}}
              .metadata
                span.date {{msg.timestamp}}
              .text {{msg.text}}
</template>

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
    ...mapState(['user']),
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
