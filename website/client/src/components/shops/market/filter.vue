<template>
  <div class="form">
    <h2 v-once>
      {{ $t('filter') }}
    </h2>
    <div class="form-group">
      <checkbox
        v-for="viewOptionKey in Object.keys(viewOptions)"
        :id="`category-${viewOptionKey}`"
        :key="viewOptionKey"
        :checked.sync="viewOptions[viewOptionKey].selected"
        :text="viewOptions[viewOptionKey].text"
      />
    </div>
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
  </div>
</template>

<script>
import Checkbox from '@/components/ui/checkbox';
import toggleSwitch from '@/components/ui/toggleSwitch';

export default {
  components: {
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
