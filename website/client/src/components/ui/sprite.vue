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
      if (!this.imageName) {
        return '';
      }
      let name = this.imageName;
      if (name.indexOf(' ') !== -1) {
        name = name.split(' ')[1];
      }
      return `https://habitica-assets.s3.amazonaws.com/mobileApp/images/${name}.png`;
    },
  },
};
</script>
