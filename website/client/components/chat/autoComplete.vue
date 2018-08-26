<template lang="pug">
div.autocomplete-selection(v-if='searchResults.length > 0', :style='autocompleteStyle')
  .autocomplete-results(v-for='result in searchResults', @click='select(result)') {{ result }}
</template>

<style scoped>
  .autocomplete-results {
    padding: .5em;
    box-shadow: 1px 1px 1px #efefef;
  }
</style>

<script>
import groupBy from 'lodash/groupBy';

export default {
  props: ['selections', 'text', 'coords', 'chat', 'carPos'],
  data () {
    return {
      currentSearch: '',
      searchActive: false,
      currentSearchPosition: 0,
      tmpSelections: [],
    };
  },
  computed: {
    autocompleteStyle () {
      return {
        top: `${this.coords.TOP + 30}px`,
        left: `${this.coords.LEFT + 30}px`,
        position: 'absolute',
        minWidth: '100px',
        minHeight: '100px',
        zIndex: 100,
        backgroundColor: 'white',
      };
    },
    searchResults () {
      if (!this.searchActive) return [];
      let currentSearch = this.text.substring(this.currentSearchPosition, this.carPos);
      return this.tmpSelections.filter((option) => {
        return option.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1;
      });
    },
  },
  mounted () {
    this.grabUserNames();
  },
  watch: {
    carPos (newCarPos) {
      let index = newCarPos - 1;
      let newText = this.text;
      if (index >= newText.length) index = newText.length - 1;
      if (!newText[index] || newText[index] === ' ') {
        this.searchActive = false;
        return;
      }
      let startIndex = index;
      while (newText[startIndex] !== '@' && startIndex >= 0) {
        if (this.text[startIndex] === ' ') break;
        startIndex--;
      }
      if (newText[startIndex] === '@') {
        this.searchActive = true;
        startIndex++;
      } else return;
      this.currentSearchPosition = startIndex;
    },
    chat () {
      this.resetDefaults();
      this.grabUserNames();
    },
  },
  methods: {
    resetDefaults () {
      // Mounted is not called when switching between group pages because they have the
      // the same parent component. So, reset the data
      this.currentSearch = '';
      this.searchActive = false;
      this.currentSearchPosition = 0;
      this.tmpSelections = [];
    },
    grabUserNames () {
      let usersThatMessage = groupBy(this.chat, 'user');
      for (let userName in usersThatMessage) {
        let systemMessage = userName === 'undefined';
        if (!systemMessage && this.tmpSelections.indexOf(userName) === -1) {
          this.tmpSelections.push(userName);
        }
      }
    },
    select (result) {
      let index = this.carPos;
      let startIndex = index;
      while (this.text[startIndex] !== '@' && startIndex >= 0) {
        startIndex--;
      }
      startIndex++;
      let newText = this.text.slice(0, this.currentSearchPosition) + result + this.text.slice(this.currentSearchPosition + index - startIndex);
      this.searchActive = false;
      this.$emit('select', newText);
    },
  },
};
</script>
