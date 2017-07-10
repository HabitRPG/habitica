<template lang="pug">
  .row
    .standard-sidebar
      .form-group
        //input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in categories",
            :key="category.identifier",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.identifier].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ category.text }}

    .standard-page
      h1.mb-0.page-header(v-once) {{ $t('market') }}

      .clearfix
        h2
          | {{ $t('items') }}

      div(
        v-for="category in categories",
        v-if="viewOptions[category.identifier].selected"
      )
        h4 {{ category.text }} - {{ category.items.length }}
        div.items
          div(v-for="item in category.items")
            div {{ item }}
</template>

<script>
  import {mapState} from 'client/libs/store';

export default {
    computed: {
      ...mapState({
        market: 'shops.market.data',
      }),
      categories () {
        if (this.market) {
          this.market.categories.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
              open: false,
            });
          });

          return this.market.categories;
        } else {
          return [];
        }
      },
    },
    data () {
      return {
        viewOptions: {},
      };
    },
    created () {
      this.$store.dispatch('shops:fetch');
    },
  };
</script>
