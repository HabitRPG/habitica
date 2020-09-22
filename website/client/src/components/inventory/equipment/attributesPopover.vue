<template>
  <div>
    <div v-if="item.locked">
      <h4 class="popover-content-title">
        {{ `${$t('lockedItem')}` }}
      </h4>
      <div
        v-if="item.currency === 'gems'"
      >
        {{ `${$t('messageNotAvailable')}` }}
      </div>
      <div
        v-else-if="isWrongClass"
      >
        {{ `${$t('classLockedItem')}` }}
      </div>
      <div v-else>
        {{ `${$t('tierLockedItem')}` }}
      </div>
    </div>
    <div v-else>
      <h4 class="popover-content-title">
        {{ itemText }}
      </h4>
      <div>
        {{ itemNotes }}
      </div>
      <attributesGrid
        :user="user"
        :item="item"
        class="mt-3 mb-2"
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
