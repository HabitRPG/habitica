<template>
  <filter-sidebar>
    <filter-group>
      <checkbox :checked.sync="viewOptions[viewOptionKey].selected"
                :id="`category-${viewOptionKey}`"
                :key="viewOptionKey"
                :text="viewOptions[viewOptionKey].text"
                v-for="viewOptionKey in Object.keys(viewOptions)"
      />
    </filter-group>
    <div class="form-group clearfix">
      <h3
          class="float-left"
          v-once
      >
        {{ $t('hideLocked') }}
      </h3>
      <toggle-switch
          @change="$emit('update:hideLocked', $event)"
          class="float-right"
          v-model="lockedChecked"
      />
    </div>
    <div class="form-group clearfix">
      <h3
          class="float-left"
          v-once
      >
        {{ $t('hidePinned') }}
      </h3>
      <toggle-switch
          @change="$emit('update:hidePinned', $event)"
          class="float-right"
          v-model="pinnedChecked"
      />
    </div>
  </filter-sidebar>
</template>

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
  props: ['hidePinned', 'hideLocked', 'viewOptions'],
  data () {
    return {
      lockedChecked: this.hideLocked,
      pinnedChecked: this.hidePinned,
    };
  },
};
</script>

<style scoped>

</style>
