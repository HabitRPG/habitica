<template lang="pug">
.autocomplete-selection(v-if='searchResults.length > 0', :style='autocompleteStyle')
  .autocomplete-results.d-flex.align-items-center(
    v-for='result in searchResults',
    @click='select(result)',
    @mouseenter='setHover(result)',
    @mouseleave='resetSelection()',
    :class='{"hover-background": result.hover}',
  )
    span
      h3.profile-name(:class='userLevelStyle(result.msg)') {{ result.displayName }}
      .svg-icon(v-html="tierIcon(result.msg)", v-if='showTierStyle(result.msg)')
    span.username.ml-2(v-if='result.username', :class='{"hover-foreground": result.hover}') @{{ result.username }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/tiers.scss';
  @import '~client/assets/scss/colors.scss';

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
import styleHelper from 'client/mixins/styleHelper';
import tier1 from 'assets/svg/tier-1.svg';
import tier2 from 'assets/svg/tier-2.svg';
import tier3 from 'assets/svg/tier-3.svg';
import tier4 from 'assets/svg/tier-4.svg';
import tier5 from 'assets/svg/tier-5.svg';
import tier6 from 'assets/svg/tier-6.svg';
import tier7 from 'assets/svg/tier-7.svg';
import tier8 from 'assets/svg/tier-mod.svg';
import tier9 from 'assets/svg/tier-staff.svg';
import tierNPC from 'assets/svg/tier-npc.svg';

export default {
  props: ['selections', 'text', 'caretPosition', 'coords', 'chat', 'textbox'],
  data () {
    return {
      atRegex: /(?!\b)@[\w-]*$/,
      currentSearch: '',
      searchActive: false,
      searchEscaped: false,
      currentSearchPosition: 0,
      tmpSelections: [],
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
        let textBoxHeight = textBox['user-entry'].clientHeight;
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
    searchResults () {
      if (!this.searchActive) return [];
      if (!this.atRegex.exec(this.text)) return [];
      this.currentSearch = this.atRegex.exec(this.text)[0];
      this.currentSearch = this.currentSearch.substring(1, this.currentSearch.length);

      return this.tmpSelections.filter((option) => {
        return option.displayName.toLowerCase().indexOf(this.currentSearch.toLowerCase()) !== -1 || option.username && option.username.toLowerCase().indexOf(this.currentSearch.toLowerCase()) !== -1;
      }).slice(0, 4);
    },

  },
  mounted () {
    this.grabUserNames();
  },
  watch: {
    text (newText) {
      if (!newText[newText.length - 1] || newText[newText.length - 1] === ' ') {
        this.searchActive = false;
        this.searchEscaped = false;
        return;
      }
      if (newText[newText.length - 1] === '@') {
        this.searchEscaped = false;
      }
      if (this.searchEscaped) return;

      if (!this.atRegex.test(newText)) return;

      this.searchActive = true;
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
      this.searchActive = false;
      this.searchEscaped = false;
      this.tmpSelections = [];
      this.resetSelection();
    },
    grabUserNames () {
      let usersThatMessage = groupBy(this.chat, 'user');
      for (let userKey in usersThatMessage) {
        let systemMessage = userKey === 'undefined';
        if (!systemMessage && this.tmpSelections.indexOf(userKey) === -1) {
          this.tmpSelections.push({
            displayName: userKey,
            username: usersThatMessage[userKey][0].username,
            msg: {
              backer: usersThatMessage[userKey][0].backer,
              contributor: usersThatMessage[userKey][0].contributor,
            },
            hover: false,
          });
        }
      }
    },
    showTierStyle (message) {
      const isContributor = Boolean(message.contributor && message.contributor.level);
      const isNPC = Boolean(message.backer && message.backer.npc);
      return isContributor || isNPC;
    },
    tierIcon (message) {
      const isNPC = Boolean(message.backer && message.backer.npc);
      if (isNPC) {
        return this.icons.tierNPC;
      }
      return this.icons[`tier${message.contributor.level}`];
    },
    select (result) {
      let newText = this.text;
      const targetName = `${result.username || result.displayName} `;
      newText = newText.replace(new RegExp(`${this.currentSearch}$`), targetName);
      this.$emit('select', newText);
      this.resetSelection();
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
        this.selected = this.selected === null ?
          0 :
          (this.selected + 1) % this.searchResults.length;
        this.searchResults[this.selected].hover = true;
      }
    },
    selectPrevious () {
      if (this.searchResults.length > 0) {
        this.clearHover();
        this.selected = this.selected === null ?
          this.searchResults.length - 1 :
          (this.selected - 1 + this.searchResults.length) % this.searchResults.length;
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
      this.searchEscaped = true;
      this.resetSelection();
    },
  },
  mixins: [styleHelper],
};
</script>
