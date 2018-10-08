<template lang="pug">
.form
  h2(v-once) {{ $t('filter') }}
  .form-group
    checkbox(
      v-for="category in categories",
      :key="category.identifier",
      :id="`category-${category.identifier}`",
      :checked.sync="viewOptions[category.identifier].selected",
      :text="category.text"
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
    props: ['hidePinned', 'hideLocked', 'categories', 'viewOptions'],
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
