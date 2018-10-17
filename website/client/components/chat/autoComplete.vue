<template lang="pug">
.autocomplete-selection(v-if='searchResults.length > 0', :style='autocompleteStyle')
  .autocomplete-results.d-flex.align-items-center(
    v-for='result in searchResults',
    @click='select(result)',
    @mouseenter='result.hover = true',
    @mouseleave='result.hover = false',
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
  props: ['selections', 'text', 'coords', 'chat', 'textbox'],
  data () {
    return {
      currentSearch: '',
      searchActive: false,
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
        minHeight: '100px',
        zIndex: 100,
        backgroundColor: 'white',
      };
    },
    searchResults () {
      if (!this.searchActive) return [];
      let currentSearch = this.text.substring(this.currentSearchPosition + 1, this.text.length);
      return this.tmpSelections.filter((option) => {
        return option.displayName.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1 || option.username && option.username.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1;
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
      }

      if (newText[newText.length - 2] !== '@') return;
      this.searchActive = true;
      this.currentSearchPosition = newText.length - 2;
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
      let newText = this.text.slice(0, this.currentSearchPosition + 1);
      if (result.username) {
        newText = newText.concat(result.username);
      } else {
        newText = newText.concat(result.displayName);
      }
      this.searchActive = false;
      this.$emit('select', newText);
    },
  },
  mixins: [styleHelper],
};
</script>
