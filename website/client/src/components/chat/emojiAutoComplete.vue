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
      renderTick: 0,
      internalCoords: { TOP: 0, LEFT: 0 },
    };
  },
  computed: {
    autocompleteStyle () {
      // eslint-disable-next-line no-unused-vars
      const _tick = this.renderTick;
      const isTextarea = this.textbox.tagName === 'TEXTAREA';
      const dropdownPA = (this.$el && this.$el.nodeType === 1) ? this.$el.offsetParent : null;
      const textboxOP = this.textbox.offsetParent;
      const needsRectCalc = dropdownPA && textboxOP && dropdownPA !== textboxOP;

      let top;
      let left;
      const caretLeft = this.internalCoords.LEFT - (this.textbox.scrollLeft || 0);

      if (needsRectCalc) {
        const textboxRect = this.textbox.getBoundingClientRect();
        const parentRect = dropdownPA.getBoundingClientRect();
        const parentScrollTop = dropdownPA.scrollTop || 0;

        if (isTextarea) {
          const computedStyle = window.getComputedStyle(this.textbox);
          const lineHeight = parseFloat(computedStyle.lineHeight)
            || (parseFloat(computedStyle.fontSize) * 1.4);
          const caretTopInTextbox = this.internalCoords.TOP
            - (this.textbox.scrollTop || 0) + lineHeight;
          const clamped = Math.min(Math.max(caretTopInTextbox, 0), this.textbox.offsetHeight);
          top = (textboxRect.top - parentRect.top) + parentScrollTop + clamped + 2;
        } else {
          top = (textboxRect.bottom - parentRect.top) + parentScrollTop + 2;
        }
        left = (textboxRect.left - parentRect.left) + caretLeft;
      } else {
        if (isTextarea) {
          const computedStyle = window.getComputedStyle(this.textbox);
          const lineHeight = parseFloat(computedStyle.lineHeight)
            || (parseFloat(computedStyle.fontSize) * 1.4);
          const caretTopInTextbox = this.internalCoords.TOP
            - (this.textbox.scrollTop || 0) + lineHeight;
          const clamped = Math.min(Math.max(caretTopInTextbox, 0), this.textbox.offsetHeight);
          top = this.textbox.offsetTop + clamped + 2;
        } else {
          top = this.textbox.offsetTop + this.textbox.offsetHeight + 2;
        }
        left = this.textbox.offsetLeft + caretLeft;
      }

      return {
        top: `${top}px`,
        left: `${left}px`,
        position: 'absolute',
        minWidth: '150px',
        zIndex: 100,
        backgroundColor: 'white',
      };
    },
  },
  watch: {
    searchResults (results, oldResults) {
      if (results.length > 0 && (!oldResults || oldResults.length === 0)) {
        this.$nextTick(() => {
          this.renderTick += 1;
        });
      }
    },
    text (newText, prevText) {
      if (!this.textbox) return;
      this._measureCaretCoords();
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
    if (!defs) return;
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
    _measureCaretCoords () {
      const el = this.textbox;
      const caretPosition = el.selectionEnd;
      const div = document.createElement('div');
      const span = document.createElement('span');
      const copyStyle = getComputedStyle(el);

      [].forEach.call(copyStyle, prop => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      document.body.appendChild(div);
      div.textContent = el.value.substr(0, caretPosition);
      span.textContent = el.value.substr(caretPosition) || '.';
      div.appendChild(span);
      this.internalCoords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    cancel () {
      this.searchActive = false;
      this.searchResults = [];
      this.resetSelection();
    },
  },
};
</script>
