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
    prefix: {
      type: String,
    },
  },
  methods: {
    imageUrl () {
      if (!this.imageName) {
        return '';
      }
      let name = this.imageName;
      console.log(this.imageName);
      if (name.indexOf(' ') !== -1) {
        const components = name.split(' ');
        name = components[components.length - 1];
      }
      if (this.prefix) {
        name = `${this.prefix}_${name}`;
      }
      return `https://habitica-assets.s3.amazonaws.com/mobileApp/images/${name}.png`;
    },
  },
};
</script>
