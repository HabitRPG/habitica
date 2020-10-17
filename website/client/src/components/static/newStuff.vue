<template>
  <div class="p-2">
    <news-content ref="newsContent" />
  </div>
</template>

<script>
import newsContent from '../news/newsContent';

export default {
  components: {
    newsContent,
  },
  mounted () {
    this.$refs.newsContent.getPosts();
  },
};
</script>
