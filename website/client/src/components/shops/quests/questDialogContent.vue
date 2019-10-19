<template>
  <div class="quest-content">
    <div
      class="quest-image"
      :class="'quest_' + item.key"
    ></div>
    <h4 class="title">
      {{ itemText }}
    </h4>
    <div
      class="text"
      v-html="itemNotes"
    ></div>
    <questInfo
      class="questInfo"
      :quest="item"
    />
  </div>
</template>


<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .quest-image {
    margin: 0 auto;
    margin-bottom: 1em;
    margin-top: 1.5em;
  }

  .text {
    margin-bottom: 8px;
    overflow-y: scroll;
    text-overflow: ellipsis;
  }

  .questInfo {
    width: 70%;
    margin: 0 auto;
    margin-bottom: 10px;
  }
</style>

<script>
import QuestInfo from './questInfo.vue';

export default {
  components: {
    QuestInfo,
  },
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
  },
};
</script>
