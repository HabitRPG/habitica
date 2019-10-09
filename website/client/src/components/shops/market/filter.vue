<template lang="pug">
.form
  h2(v-once) {{ $t('filter') }}
  .form-group
    checkbox(
      v-for="viewOptionKey in Object.keys(viewOptions)",
      :key="viewOptionKey",
      :id="`category-${viewOptionKey}`",
      :checked.sync="viewOptions[viewOptionKey].selected",
      :text="viewOptions[viewOptionKey].text"
    )
  div.form-group.clearfix
    h3.float-left(v-once) {{ $t('hideLocked') }}
    toggle-switch.float-right(
      v-model="lockedChecked",
      @change="$emit('update:hideLocked', $event)"
    )
  div.form-group.clearfix
    h3.float-left(v-once) {{ $t('hidePinned') }}
    toggle-switch.float-right(
      v-model="pinnedChecked",
      @change="$emit('update:hidePinned', $event)"
    )
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
