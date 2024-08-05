<template>
  <img
    class="pixel-art"
    v-if="imageName && imageName !== ''"
    :src="imageUrl()"
  >
</template>

<style>
.pixel-art {
  image-rendering: pixelated;
}
</style>

<script>
import GIF_SPRITES from '@/../../common/script/content/constants/gifSprites';

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
    getFileType (name) {
      if (GIF_SPRITES.includes(name)) {
        return 'gif';
      }
      return 'png';
    },
    imageUrl () {
      if (!this.imageName) {
        return '';
      }
      let name = this.imageName;
      if (name.indexOf(' ') !== -1) {
        const components = name.split(' ');
        name = components[components.length - 1];
      }
      if (this.prefix) {
        name = `${this.prefix}_${name}`;
      }
      return `https://habitica-assets.s3.amazonaws.com/mobileApp/images/${name}.${this.getFileType(name)}`;
    },
  },
};
</script>
