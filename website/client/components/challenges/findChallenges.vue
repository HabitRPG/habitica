<template lang='pug'>
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10.no-challenges.standard-page
</template>

<script>
import Sidebar from './sidebar';

export default {
  components: { Sidebar },
  data () {
    return {};
  },
  methods: {
    updateSearch () {

    },
    updateFilters () {

    },
  },
};
</script>
