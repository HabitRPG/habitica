<template>
  <div>
    <div v-if="item.locked">
      <h4 class="popover-content-title">
        {{ `${$t('lockedItem')}` }}
      </h4>
      <div
        v-if="isWrongClass"
        class="popover-content-text"
      >
        {{ `${$t('classLockedItem')}` }}
      </div>
      <div
        v-else
        class="popover-content-text"
      >
        {{ `${$t('tierLockedItem')}` }}
      </div>
      <p></p>
    </div>
    <div v-else>
      <h4 class="popover-content-title">
        {{ itemText }}
      </h4>
      <div class="popover-content-text">
        {{ itemNotes }}
      </div>
      <attributesGrid
        :user="user"
        :item="item"
      />
    </div>
  </div>
</template>

<style scoped>
  .popover-content-text {
    margin-bottom: 25px;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import attributesGrid from './attributesGrid';
import statsMixin from '@/mixins/stats';

export default {
  components: {
    attributesGrid,
  },
  mixins: [statsMixin],
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      ATTRIBUTES: 'constants.ATTRIBUTES',
      user: 'user.data',
    }),
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
    isWrongClass () {
      const wrongKlass = this.item.klass && !['special', 'armoire', this.user.stats.class].includes(this.item.klass);
      const wrongSpecialClass = this.item.klass === 'special' && this.item.specialClass && this.item.specialClass !== this.user.stats.class;
      return wrongKlass || wrongSpecialClass;
    },
  },
};
</script>
