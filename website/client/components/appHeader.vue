<template lang="pug">
#app-header.row
  user-list-detail
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

// TODO move to colors.scss if used in other places
$header-dark-background: #271B3D;
$header-text-color: #D5C8FF;

/* TODO refactor: only partially ported from SemanticUI; */
#app-header {
  padding-left: 14px;
  margin-top: 56px;
  background: $purple-50;
  height: 192px;
  color: $header-text-color;
}
</style>

<script>
import UserListDetail from './userListDetail';

export default {
  components: {
    UserListDetail,
  },
};
</script>
