<template>
  <b-modal
    id="drops-enabled"
    :title="$t('dropsEnabled')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-6 offset-3 text-center">
        <p></p><div class="item-drop-icon Pet_Egg_Wolf"></div><span v-html="firstDropText"></span></p><p></p><div class="item-drop-icon Pet_Currency_Gem"></div><span v-html="$t('useGems')"></span></p>
      </div>
    </div><div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('close') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .item-drop-icon {
    margin: 0 auto;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import * as eggs from '@/../../common/script/content/eggs';

export default {
  data () {
    return {
      eggs,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
