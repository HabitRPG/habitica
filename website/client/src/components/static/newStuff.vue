<template>
  <news-content ref="newsContent" />
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
