<template>
  <filter-sidebar>
    <filter-group>
      <checkbox
        v-for="(viewOptionEntry, viewOptionKey) in viewOptions"
        :id="`category-${viewOptionKey}`"
        :key="viewOptionKey"
        :checked.sync="viewOptionEntry.selected"
        :text="viewOptionEntry.text"
      />
    </filter-group>
    <div class="form-group clearfix">
      <h3
        v-once
        class="float-left"
      >
        {{ $t('hideLocked') }}
      </h3>
      <toggle-switch
        v-model="lockedChecked"
        class="float-right"
        @change="$emit('update:hideLocked', $event)"
      />
    </div>
    <div class="form-group clearfix">
      <h3
        v-once
        class="float-left"
      >
        {{ $t('hidePinned') }}
      </h3>
      <toggle-switch
        v-model="pinnedChecked"
        class="float-right"
        @change="$emit('update:hidePinned', $event)"
      />
    </div>
  </filter-sidebar>
</template>

<style scoped>

</style>

<script>
import Checkbox from '@/components/ui/checkbox';
import toggleSwitch from '@/components/ui/toggleSwitch';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';

export default {
  components: {
    FilterGroup,
    FilterSidebar,
    Checkbox,
    toggleSwitch,
  },
  props: {
    hideLocked: {
      type: Boolean,
      required: true,
    },
    hidePinned: {
      type: Boolean,
      required: true,
    },
    viewOptions: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      lockedChecked: this.hideLocked,
      pinnedChecked: this.hidePinned,
    };
  },
};
</script>
