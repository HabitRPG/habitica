<template>
  <div class="categories">
    <span
      v-if="owner"
      class="category-label category-label-blue"
    >{{ $t('owned') }}</span>
    <span
      v-if="member"
      class="category-label category-label-green"
    >{{ $t('joined') }}</span>
    <span
      v-for="category in categories"
      :key="category.slug"
      class="category-label"
      :class="{'category-label-purple':isOfficial(category)}"
    >{{ $t(category.name) }}</span>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    categories: {
      type: Array,
      required: true,
    },
    owner: {
      type: Boolean,
      default: false,
    },
    member: {
      type: Boolean,
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
