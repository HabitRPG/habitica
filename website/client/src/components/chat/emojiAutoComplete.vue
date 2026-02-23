<template>
  <div
    v-if="searchResults.length > 0"
    class="autocomplete-selection"
    :style="autocompleteStyle"
  >
    <div
      v-for="result in searchResults"
      :key="result.shortcode"
      class="autocomplete-results d-flex align-items-center"
      :class="{'hover-background': result.hover}"
      @click="select(result)"
      @mouseenter="setHover(result)"
      @mouseleave="resetSelection()"
    >
      <img
        v-if="result.imageUrl"
        class="emoji-img"
        :src="result.imageUrl"
        :alt="result.shortcode"
      >
      <span
        v-else
        class="emoji-char"
      >{{ result.emoji }}</span>
      <span
        class="shortcode ml-2"
        :class="{'hover-foreground': result.hover}"
      >:{{ result.shortcode }}:</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .autocomplete-results {
    padding: .5em;
  }

  .autocomplete-selection {
    box-shadow: 1px 1px 1px #efefef;
  }

  .hover-background {
    background-color: rgba(213, 200, 255, 0.32);
    cursor: pointer;
  }

  .hover-foreground {
    color: $purple-300 !important;
  }

  .emoji-char {
    font-size: 20px;
    line-height: 1;
  }

  .emoji-img {
    height: 20px;
    width: 20px;
  }

  .shortcode {
    color: $gray-200;
    font-size: 14px;
  }
</style>

<script>
import habiticaMarkdown from 'habitica-markdown';

export default {
  props: ['text', 'caretPosition', 'coords', 'textbox'],
  data () {
    return {
      colonRegex: /:([a-zA-Z0-9_+]*)$/,
      currentSearch: '',
      searchActive: false,
      searchResults: [],
      selected: null,
      emojiList: [],
    };
  },
  computed: {
    autocompleteStyle () {
      const isTextarea = this.textbox.tagName === 'TEXTAREA';
      let top;

      if (isTextarea) {
        const computedStyle = window.getComputedStyle(this.textbox);
        const lineHeight = parseFloat(computedStyle.lineHeight)
          || (parseFloat(computedStyle.fontSize) * 1.4);
        const caretTopInTextbox = this.coords.TOP - (this.textbox.scrollTop || 0) + lineHeight;
        const clamped = Math.min(Math.max(caretTopInTextbox, 0), this.textbox.offsetHeight);
        top = this.textbox.offsetTop + clamped + 2;
      } else {
        top = this.textbox.offsetTop + this.textbox.offsetHeight + 2;
      }

      return {
        top: `${top}px`,
        left: `${this.textbox.offsetLeft}px`,
        position: 'absolute',
        minWidth: '150px',
        zIndex: 100,
        backgroundColor: 'white',
      };
    },
  },
  watch: {
    text (newText, prevText) {
      if (!this.textbox) return;
      const delCharsBool = prevText.length > newText.length;
      const caretPosition = this.textbox.selectionEnd;
      const lastFocusChar = delCharsBool ? prevText[caretPosition] : newText[caretPosition - 1];
      if (
        newText.length === 0
        || (lastFocusChar === ':' && delCharsBool)
      ) {
        this.cancel();
      } else {
        if (lastFocusChar === ':') this.searchActive = true;
        if (this.searchActive) {
          this.searchResults = this.solveSearchResults(newText.substring(0, caretPosition));
        }
      }
    },
  },
  created () {
    const defs = habiticaMarkdown.emojiDefs;
    const customEmojis = habiticaMarkdown.customEmojis || {};
    const list = [];
    const keys = Object.keys(defs);
    keys.sort();
    for (const key of keys) {
      const entry = { shortcode: key, emoji: defs[key], hover: false };
      if (customEmojis[key]) {
        entry.imageUrl = customEmojis[key];
      }
      list.push(entry);
    }
    this.emojiList = list;
  },
  methods: {
    solveSearchResults (textFocus) {
      const regexRes = this.colonRegex.exec(textFocus);
      if (!regexRes) {
        this.cancel();
        return [];
      }
      this.currentSearch = regexRes[1];

      if (this.currentSearch.length === 0) return [];

      const lowerSearch = this.currentSearch.toLowerCase();
      return this.emojiList
        .filter(entry => entry.shortcode.startsWith(lowerSearch))
        .slice(0, 6)
        .map(entry => ({ ...entry, hover: false }));
    },
    select (result) {
      const { text } = this;
      const targetName = `${result.shortcode}: `;
      const oldCaret = this.caretPosition;
      const escapedSearch = this.currentSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let newText = text.substring(0, this.caretPosition)
        .replace(new RegExp(`${escapedSearch}$`), targetName);
      const newCaret = newText.length;
      newText += text.substring(oldCaret, text.length);
      this.$emit('select', newText, newCaret);

      this.cancel();
    },
    setHover (result) {
      this.resetSelection();
      result.hover = true;
    },
    clearHover () {
      for (const selection of this.searchResults) {
        selection.hover = false;
      }
    },
    resetSelection () {
      this.clearHover();
      this.selected = null;
    },
    selectNext () {
      if (this.searchResults.length > 0) {
        this.clearHover();
        this.selected = this.selected === null
          ? 0
          : (this.selected + 1) % this.searchResults.length;
        this.searchResults[this.selected].hover = true;
      }
    },
    selectPrevious () {
      if (this.searchResults.length > 0) {
        this.clearHover();
        this.selected = this.selected === null
          ? this.searchResults.length - 1
          : (this.selected - 1 + this.searchResults.length) % this.searchResults.length;
        this.searchResults[this.selected].hover = true;
      }
    },
    makeSelection () {
      if (this.searchResults.length > 0 && this.selected !== null) {
        const result = this.searchResults[this.selected];
        this.select(result);
      }
    },
    cancel () {
      this.searchActive = false;
      this.searchResults = [];
      this.resetSelection();
    },
  },
};
</script>
