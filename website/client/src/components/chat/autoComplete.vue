<template>
  <div
    v-if="searchResults.length > 0"
    class="autocomplete-selection"
    :style="autocompleteStyle"
  >
    <div
      v-for="result in searchResults"
      :key="result.username"
      class="autocomplete-results d-flex align-items-center"
      :class="{'hover-background': result.hover}"
      @click="select(result)"
      @mouseenter="setHover(result)"
      @mouseleave="resetSelection()"
    >
      <span>
        <h3
          class="profile-name"
          :class="userLevelStyle(result.msg)"
        >{{ result.displayName }}</h3>
        <div
          v-if="showTierStyle(result.msg)"
          class="svg-icon"
          v-html="tierIcon(result.msg)"
        ></div>
      </span>
      <span
        v-if="result.username"
        class="username ml-2"
        :class="{'hover-foreground': result.hover}"
      >@{{ result.username }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/tiers.scss';
  @import '~@/assets/scss/colors.scss';

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

  .profile-name {
    display: inline-block;
    font-size: 16px;
    margin-bottom: 0rem;
  }

  .svg-icon {
    width: 10px;
    display: inline-block;
    margin-left: .5em;
  }

  .username {
    color: $gray-200;
  }
</style>

<script>
import groupBy from 'lodash/groupBy';
import styleHelper from '@/mixins/styleHelper';
import tier1 from '@/assets/svg/tier-1.svg';
import tier2 from '@/assets/svg/tier-2.svg';
import tier3 from '@/assets/svg/tier-3.svg';
import tier4 from '@/assets/svg/tier-4.svg';
import tier5 from '@/assets/svg/tier-5.svg';
import tier6 from '@/assets/svg/tier-6.svg';
import tier7 from '@/assets/svg/tier-7.svg';
import tier8 from '@/assets/svg/tier-mod.svg';
import tier9 from '@/assets/svg/tier-staff.svg';
import tierNPC from '@/assets/svg/tier-npc.svg';

export default {
  mixins: [styleHelper],
  props: ['selections', 'text', 'caretPosition', 'coords', 'chat', 'textbox'],
  data () {
    return {
      atRegex: /(?!\b)@([\w-]*)$/,
      currentSearch: '',
      searchActive: false,
      currentSearchPosition: 0,
      tmpSelections: [],
      searchResults: [],
      icons: Object.freeze({
        tier1,
        tier2,
        tier3,
        tier4,
        tier5,
        tier6,
        tier7,
        tier8,
        tier9,
        tierNPC,
      }),
      selected: null,
    };
  },
  computed: {
    autocompleteStyle () {
      function heightToUse (textBox, topCoords) {
        const textBoxHeight = textBox.clientHeight;
        return topCoords < textBoxHeight ? topCoords + 30 : textBoxHeight + 10;
      }
      return {
        top: `${heightToUse(this.textbox, this.coords.TOP)}px`,
        left: `${this.coords.LEFT + 30}px`,
        marginLeft: '-28px',
        marginTop: '28px',
        position: 'absolute',
        minWidth: '100px',
        zIndex: 100,
        backgroundColor: 'white',
      };
    },
  },
  watch: {
    text (newText, prevText) {
      const delCharsBool = prevText.length > newText.length;
      const caretPosition = this.textbox.selectionEnd;
      const lastFocusChar = delCharsBool ? prevText[caretPosition] : newText[caretPosition - 1];
      if (
        newText.length === 0 // Delete all
        || /\s/.test(lastFocusChar) // End Search
        || (lastFocusChar === '@' && delCharsBool) // Cancel Search
      ) {
        this.cancel();
      } else {
        if (lastFocusChar === '@') this.searchActive = true;
        if (this.searchActive) {
          this.searchResults = this.solveSearchResults(newText.substring(0, caretPosition));
        }
      }
    },
    chat () {
      this.resetDefaults();
      this.grabUserNames();
    },
  },
  mounted () {
    this.grabUserNames();
  },
  methods: {
    solveSearchResults (textFocus) {
      const regexRes = this.atRegex.exec(textFocus);
      if (!regexRes) return [];
      this.currentSearch = regexRes[1]; // eslint-disable-line vue/no-side-effects-in-computed-properties, max-len, prefer-destructuring

      const lowerCaseSearch = this.currentSearch.toLowerCase();

      return this.tmpSelections
        .filter(option => option.displayName.toLowerCase().includes(lowerCaseSearch)
            || (option.username && option.username.toLowerCase().includes(lowerCaseSearch)))
        .slice(0, 4);
    },
    resetDefaults () {
      // Mounted is not called when switching between group pages because they have the
      // the same parent component. So, reset the data
      this.cancel();
      this.tmpSelections = [];
    },
    grabUserNames () {
      const usersThatMessage = groupBy(this.chat, 'user');
      for (const userKey of Object.keys(usersThatMessage)) {
        const systemMessage = userKey === 'undefined';
        if (!systemMessage && !this.tmpSelections.find(res => res.displayName === userKey)) {
          this.tmpSelections.push({
            displayName: userKey,
            username:
              usersThatMessage[userKey]
              && usersThatMessage[userKey][0]
              && usersThatMessage[userKey][0].username,
            msg: {
              backer: usersThatMessage[userKey]
                && usersThatMessage[userKey][0]
                && usersThatMessage[userKey][0].backer,
              contributor: usersThatMessage[userKey]
                && usersThatMessage[userKey][0]
                && usersThatMessage[userKey][0].contributor,
            },
            hover: false,
          });
        }
      }
    },
    showTierStyle (message) {
      const isContributor = Boolean(message.contributor && message.contributor.level);
      const isNPC = Boolean(message.backer && message.backer.tier === 800);

      return isContributor || isNPC;
    },
    tierIcon (message) {
      const isNPC = Boolean(message.backer && message.backer.tier === 800);
      if (isNPC) {
        return this.icons.tierNPC;
      }
      const isContributor = Boolean(message.contributor && message.contributor.level);

      return isContributor ? this.icons[`tier${message.contributor.level}`] : null;
    },
    select (result) {
      const { text } = this;
      const targetName = `${result.username || result.displayName} `;
      const oldCaret = this.caretPosition;
      let newText = text.substring(0, this.caretPosition)
        .replace(new RegExp(`${this.currentSearch}$`), targetName);
      const newCaret = newText.length;
      newText += text.substring(oldCaret, text.length);
      this.$emit('select', newText, newCaret);

      // Made selection, shut off searching
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
      // Resets search back to normal (while in the same chat zone)
      this.searchActive = false;
      this.searchResults = [];
      this.resetSelection();
    },
  },
};
</script>
