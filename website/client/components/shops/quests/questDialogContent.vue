<template lang="pug">
  div.quest-content
    .quest-image(:class="'quest_' + item.key")

    h4.title {{ itemText }}
    div.text(v-html="itemNotes")

    questInfo.questInfo(:quest="item")
</template>


<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
    computed: {
      itemText () {
        if (this.item.text instanceof Function) {
          return this.item.text();
        } else {
          return this.item.text;
        }
      },
      itemNotes () {
        if (this.item.notes instanceof Function) {
          return this.item.notes();
        } else {
          return this.item.notes;
        }
      },
    },
    props: {
      item: {
        type: Object,
      },
    },
  };
</script>
