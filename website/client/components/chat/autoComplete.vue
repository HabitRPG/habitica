<template lang="pug">
div.autocomplete-selection
  div(v-for='result in searchResults', @click='select(result)') {{ result }}
</template>

<style scoped>

</style>

<script>
export default {
  props: ['selections', 'text'],
  data () {
    return {
      currentSearch: '',
      searchActive: false,
      currentSearchPosition: 0,
      // @TODO: HAve this passed
      tmpSelections: [
        'TheHollidayInn',
        'Paglias',
      ],
    };
  },
  computed: {
    searchResults () {
      if (!this.searchActive) return [];
      let currentSearch = this.text.substring(this.currentSearchPosition + 1, this.text.length);
      return this.tmpSelections.filter((option) => {
        return option.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1;
      });
    },
  },
  watch: {
    text (newText) {
      if (newText[newText.length - 1] !== '@') return;
      this.searchActive = true;
      this.currentSearchPosition = newText.length - 1;
    },
    // @TODO: implement position
    // caretChanged = function(newCaretPos) {
    //   var relativeelement = $('.chat-form div:first');
    //   var textarea = $('.chat-form textarea');
    //   var userlist = $('.list-at-user');
    //   var offset = {
    //     x: textarea.offset().left - relativeelement.offset().left,
    //     y: textarea.offset().top - relativeelement.offset().top,
    //   };
    //   if(relativeelement) {
    //     var caretOffset = InputCaret.getPosition(textarea);
    //     userlist.css({
    //               left: caretOffset.left + offset.x,
    //               top: caretOffset.top + offset.y + 16
    //             });
    //   }
    // }
  },
  methods: {
    select (result) {
      let newText = this.text.slice(0, this.currentSearchPosition + 1) + result;
      this.searchActive = false;
      this.$emit('select', newText);
    },
  },
};
</script>
