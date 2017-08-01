<template lang="pug">
  b-modal#new-stuff(:title="$t('newStuff')", size='lg', :hide-footer="true")
    .modal-header
      | {{ this.$t('newStuff') }} by&nbsp;
      a(target='_blank', href='https://twitter.com/Mihakuu') Bailey
    .modal-body.new-stuff-modal.modal-fixed-height
      div(:class="baileyClass")
      br
      br
      div(ng-bind-html='latestBaileyMessage')
    .modal-footer
      a.btn.btn-info(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ this.$t('newsArchive') }}
      button.btn.btn-default(@click='close()') {{ this.$t('cool') }}
      button.btn.btn-warning(@click='dismissAlert(); close()') {{ this.$t('dismissAlert') }}
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

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
  mounted () {
    // @TODO: $http.get('/new-stuff.html') ?
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'new-stuff');
    },
  },
};
</script>
