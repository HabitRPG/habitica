<template lang="pug">
  b-modal#new-stuff(v-if='user.flags.newStuff', :title="$t('newStuff')", size='lg', :hide-footer="true")
    .modal-body.new-stuff-modal
      h3.text-center
        | {{ this.$t('newStuff') }} by&nbsp;
        a(target='_blank', href='https://twitter.com/Mihakuu') Bailey
      div(:class="baileyClass")
      div(v-html='latestBaileyMessage')
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-default(@click='close()') {{ this.$t('cool') }}
      button.btn.btn-warning(@click='dismissAlert();') {{ this.$t('dismissAlert') }}
</template>

<script>
import axios from 'axios';
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapState } from 'client/libs/store';

export default {
  components: {
    bModal,
  },
  data () {
    let worldDmg = {
      bailey: true,
    };

    return {
      baileyClass: {
        'npc_bailey_broken': worldDmg.bailey, // eslint-disable-line
        'npc_bailey': !worldDmg.bailey, // eslint-disable-line
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    async latestBaileyMessage () {
      let message = await axios.get('/new-stuff');
      return message;
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'new-stuff');
    },
    dismissAlert () {
      this.$store.dispatch('user:set', {'flags.newStuff': false});
      this.close();
    },
  },
};
</script>
