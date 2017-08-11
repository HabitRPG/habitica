<template lang="pug">
  b-modal#drops-enabled(:title="$t('dropsEnabled')", size='lg', :hide-footer="true")
    .modal-header
      h4 {{ $t('dropsEnabled') }}
    .modal-body
      p
        figure
          .item-drop-icon(class='Pet_Egg_Wolf')
        span {{ firstDropText }}
      br
      p
        figure
          .item-drop-icon(class='Pet_Currency_Gem')
        span {{ $t('useGems') }}
    .modal-footer
      button.btn.btn-default(@click='close()') {{ $t('close') }}
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import { mapState } from 'client/libs/store';
import eggs from '../../../common/script/content/eggs';

export default {
  components: {
    bModal,
  },
  data () {
    return {
      eggs,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    firstDropText () {
      return this.$t('firstDrop', {
        eggText: this.eggs.all.Wolf.text(),
        eggNotes: this.eggs.all.Wolf.notes(),
      });
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'drops-enabled');
    },
  },
};
</script>
