<template lang="pug">
.row.user-tasks-page
  .col-12
    .row.tasks-navigation
      .col-4.offset-4
        input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
      .col-1.offset-3
        button.btn.btn-success(v-once) 
          .svg-icon.positive(v-html="icons.positive")
          | {{ $t('create') }}
    .row.tasks-columns
      task-column.col-3(
        v-for="column in columns", 
        :type="column", :key="column", 
        :isUser="true", :searchText="searchTextThrottled",
      )
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.user-tasks-page {
  padding-top: 31px;
  height: calc(100% - 235px); // header + padding
}

.tasks-navigation {
  margin-bottom: 40px;
}

.positive {
  display: inline-block;
  width: 10px;
  color: $green-500;
  margin-right: 8px;
  padding-top: 6px;
}

.tasks-columns {
  height: 100%;
}
</style>

<script>
import Column from './column';
import positiveIcon from 'assets/svg/positive.svg';
import throttle from 'lodash/throttle';

export default {
  components: {
    TaskColumn: Column,
  },
  data () {
    return {
      columns: ['habit', 'daily', 'todo', 'reward'],
      searchText: null,
      searchTextThrottled: null,
      icons: Object.freeze({
        positive: positiveIcon,
      }),
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText;
    }, 250),
  },
};
</script>
