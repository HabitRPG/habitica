<template lang="pug">
  b-modal#drops-enabled(:title="$t('dropsEnabled')", size='lg', :hide-footer="true")
    .modal-body
      .col-6.offset-3.text-center
        p
          .item-drop-icon(class='Pet_Egg_Wolf')
          span(v-html='firstDropText')
        p
          .item-drop-icon(class='Pet_Currency_Gem')
          span(v-html="$t('useGems')")
    .modal-footer
      .col-12.text-center
        button.btn.btn-primary(@click='close()') {{ $t('close') }}
</template>

<style scoped>
  .item-drop-icon {
    margin: 0 auto;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import eggs from '../../../common/script/content/eggs';

export default {
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
      this.$root.$emit('bv::hide::modal', 'drops-enabled');
    },
  },
};
</script>
