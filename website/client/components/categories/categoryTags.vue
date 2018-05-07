<template lang="pug">
  .categories
    span.category-label.category-label-blue(v-if='isOwner')
     | {{ $t('owned') }}
    span.category-label(
      v-for='category in categories',
      :class="{'category-label-purple':isOfficial(category)}"
    )
     | {{ $t(category.name) }}
    slot
</template>

<script>
  import {mapState} from 'client/libs/store';

  export default {
    props: {
      categories: {
        required: true,
      },
      ownerId: {
        default: null,
      },
    },
    computed: {
      ...mapState({user: 'user.data'}),
      isOwner () {
        return this.ownerId && this.ownerId === this.user._id;
      },
    },
    methods: {
      isOfficial (category) {
        return category.name === 'habitica_official';
      },
    },
  };
</script>