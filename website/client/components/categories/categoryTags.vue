<template lang="pug">
  .categories
    span.category-label.category-label-blue(v-if='owner')
      | {{ $t('owned') }}
    span.category-label.category-label-green(v-if='member')
      | {{ $t('joined') }}
    span.category-label(
      v-for='category in categories',
      :class="{'category-label-purple':isOfficial(category)}"
    )
     | {{ $t(category.name) }}
    slot
</template>

<script>
  export default {
    props: {
      categories: {
        required: true,
      },
      owner: {
        default: false,
      },
      member: {
        default: false,
      },
    },
    methods: {
      isOfficial (category) {
        return category.name === 'habitica_official';
      },
    },
  };
</script>