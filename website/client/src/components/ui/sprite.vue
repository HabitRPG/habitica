<template>
  <img
  v-if="imageName && imageName !== ''"
  :src="imageUrl()">
</template>

<script>
export default {
  props: {
    imageName: {
      type: String,
    },
  },
  methods: {
    imageUrl () {
      return `https://habitica-assets.s3.amazonaws.com/mobileApp/images/${this.imageName}.png`;
    },
  },
};
</script>
