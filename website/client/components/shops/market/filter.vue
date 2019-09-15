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
  import Checkbox from 'client/components/ui/checkbox';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  export default {
    props: ['hidePinned', 'hideLocked', 'viewOptions'],
    components: {
      Checkbox,
      toggleSwitch,
    },
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
