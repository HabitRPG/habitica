<template>
  <div>
    <b-dropdown
      ref="dropdown"
      class="inline-dropdown select-multi"
      :toggle-class="isOpened ? 'active' : null"
      @show="wasOpened()"
      @hide="hideCallback($event)"
      @toggle="openOrClose($event)"
    >
      <b-dropdown-header>
        <div class="mb-2 search-input-wrapper">
          <b-form-input
            ref="searchInput"
            v-model="search"
            type="text"
            :placeholder="searchPlaceholder"
            @focus="setTextbox"
            @keydown="autoCompleteMixinUpdateCarretPosition"
            @keydown.tab="autoCompleteMixinHandleTab($event)"
            @keydown.up="autoCompleteMixinSelectPreviousAutocomplete($event)"
            @keydown.down="autoCompleteMixinSelectNextAutocomplete($event)"
            @keydown.enter="searchEnterHandler($event)"
            @keydown.esc="searchEscHandler($event)"
          />
          <emoji-auto-complete
            ref="emojiAutocomplete"
            :text="search"
            :textbox="textbox"
            :coords="mixinData.autoComplete.coords"
            :caret-position="mixinData.autoComplete.caretPosition"
            @select="selectedAutocomplete"
          />
        </div>

        <multi-list
          v-if="selectedItems.length > 0"
          :add-new="addNew"
          :pill-invert="pillInvert"
          :items="selectedItemsAsObjects"
          :max-items="0"
          @remove-item="removeItem($event)"
        />
      </b-dropdown-header>
      <template #button-content>
        <multi-list
          class="d-flex flex-wrap"
          :items="selectedItemsAsObjects"
          :add-new="addNew"
          :pill-invert="pillInvert"
          :empty-message="emptyMessage"
          @remove-item="removeItem($event)"
        />
      </template>
      <div
        v-if="addNew || availableToSelect.length > 0"
        :class="{
          'item-group': true,
          'add-new': search !== '' && !hasExactMatch,
          'scroll': availableToSelect.length > 5
        }"
      >
        <b-dropdown-item-button
          v-for="item in availableToSelect"
          :key="item.id"
          class="ignore-hide multi-item"
          :class="{ 'none': item.id === 'none', selectListItem: true }"
          @click="selectItem(item)"
        >
          <div
            v-markdown="item.name"
            class="label"
          ></div>
          <div
            v-if="item.challenge"
            class="addl-text"
          >
            {{ $t('challenge') }}
          </div>
          <div
            v-else-if="item.addlText"
            class="addl-text"
          >
            {{ item.addlText }}
          </div>
        </b-dropdown-item-button>

        <div
          v-if="addNew && search !== '' && !hasExactMatch"
          class="hint"
        >
          {{ $t('pressEnterToAddTag', { tagName: search }) }}
        </div>
      </div>
    </b-dropdown>
  </div>
</template>

<style lang="scss">
@import '@/assets/scss/colors.scss';

$itemHeight: 2rem;

.inline-dropdown {
  &.select-multi .dropdown-toggle {
    line-height: 1.571;
    padding-bottom: 0px;
  }
}

.select-multi {
  .search-input-wrapper {
    position: relative;
  }

  .dropdown-toggle {
    padding-left: 0.75rem;
  }

  .dropdown-header {
    background-color: $gray-700;
    padding-bottom: 0;
    min-height: 3rem;
  }

  .dropdown-item, .dropdown-header {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .none {
    cursor: default;
    pointer-events: none;
  }

  .multi-item button {
    height: $itemHeight;
    display: flex;

    .label {
      height: 1.5rem;
      font-size: 14px;
      line-height: 1.71;
      flex: 1;
    }

    .addl-text {
      height: 1rem;
      font-size: 12px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.33;
      letter-spacing: normal;
      text-align: right;
      color: $gray-100;
      align-self: center;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      margin-right: 0.25rem;
    }

    &:hover {
      .addl-text {
        color: $purple-300;
      }
    }
  }

  .item-group {
    max-height: #{5*$itemHeight};

    &.add-new {
      min-height: 30px;
      height: auto;

      .hint {
        display: block;
      }
    }
    &.scroll {
      overflow-y: scroll;
    }
  }

  .hint {
    display: none;
    height: 2rem;
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.33;
    letter-spacing: normal;
    color: $gray-100;

    margin-left: 0.75rem;
    margin-top: 0.5rem;
  }
}

</style>

<script>
import Vue from 'vue';
import MultiList from '@/components/tasks/modal-controls/multiList';
import markdownDirective from '@/directives/markdown';
import emojiAutoComplete from '@/components/chat/emojiAutoComplete';
import { autoCompleteHelperMixin } from '@/mixins/autoCompleteHelper';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
    MultiList,
    emojiAutoComplete,
  },
  mixins: [autoCompleteHelperMixin],
  props: {
    addNew: {
      type: Boolean,
      default: false,
    },
    allItems: {
      type: Array,
    },
    emptyMessage: {
      type: String,
    },
    pillInvert: {
      type: Boolean,
      default: false,
    },
    searchPlaceholder: {
      type: String,
    },
    selectedItems: {
      type: Array,
    },
  },
  data () {
    return {
      isOpened: false,
      wasTagAdded: false,
      selected: this.selectedItems,
      search: '',
      textbox: null,
      itemsAdded: [],
    };
  },
  computed: {
    selectedItemsIdList () {
      return this.selectedItems
        ? this.selectedItems.map(t => t)
        : [];
    },
    allItemsMap () {
      const obj = {};
      this.allItems.forEach(t => {
        obj[t.id] = t;
      });
      return obj;
    },
    selectedItemsAsObjects () {
      return this.selectedItems.map(t => this.allItemsMap[t]);
    },
    availableToSelect () {
      const availableItems = this.allItems.filter(t => !this.selectedItemsIdList.includes(t.id));

      const searchString = this.search.toLowerCase();

      const filteredItems = availableItems.filter(i => i.name.toLowerCase().includes(searchString));

      return filteredItems;
    },
    hasExactMatch () {
      const searchTerm = this.search.trim().toLowerCase();
      if (!searchTerm) return false;
      if (this.itemsAdded.indexOf(searchTerm) !== -1) return true;
      if (this.availableToSelect.length === 0) return false;
      if (this.availableToSelect[0].name.toLowerCase() === searchTerm) {
        return true;
      }
      return false;
    },
  },
  watch: {
    selected () {
      this.$emit('changed', this.selected);
    },
  },
  created () {
    document.addEventListener('keyup', this.handleEsc);
  },
  beforeDestroy () {
    document.removeEventListener('keyup', this.handleEsc);
  },
  mounted () {
    this.$refs.dropdown.clickOutHandler = () => {
      this.closeSelectPopup();
    };
  },
  methods: {
    closeSelectPopup () {
      this.preventHide = false;
      this.isOpened = false;
      if (!this.wasTagAdded) {
        Vue.nextTick(() => {
          this.$refs.dropdown.hide();
        });
      }
      this.wasTagAdded = false;
    },
    openOrClose ($event) {
      if (this.isOpened) {
        this.closeSelectPopup();
        $event.preventDefault();
      }
    },
    closeIfOpen () {
      this.closeSelectPopup();
    },
    selectItem (item) {
      if (!item) return;
      this.selectedItems.push(item.id);
      this.$emit('toggle', item.id);
      this.preventHide = true;
      this.wasTagAdded = true;
    },
    removeItem ($event) {
      const foundIndex = this.selectedItems.findIndex(t => t === $event);
      this.selectedItems.splice(foundIndex, 1);
      this.$emit('toggle', $event);
    },
    hideCallback ($event) {
      if (this.preventHide) {
        $event.preventDefault();
        return;
      }
      this.isOpened = false;
    },
    wasOpened () {
      this.isOpened = true;
      this.preventHide = false;
    },
    handleEsc (e) {
      if (e.keyCode === 27) {
        this.closeSelectPopup();
      }
    },
    setTextbox () {
      const ref = this.$refs.searchInput;
      this.textbox = ref ? (ref.$el || ref) : null;
    },
    searchEnterHandler (e) {
      const ac = this._getActiveAutocomplete();
      if (ac && ac.selected !== null) {
        e.preventDefault();
        e.stopPropagation();
        ac.makeSelection();
      } else {
        if (ac) ac.cancel();
        this.handleSubmit();
      }
    },
    searchEscHandler (e) {
      const ac = this._getActiveAutocomplete();
      if (ac && ac.searchActive) {
        e.preventDefault();
        e.stopPropagation();
        ac.cancel();
      }
    },
    selectedAutocomplete (newText, newCaret) {
      this.search = newText;
      this.$nextTick(() => {
        if (this.textbox) {
          this.textbox.setSelectionRange(newCaret, newCaret);
          this.textbox.focus();
        }
      });
    },
    handleSubmit () {
      if (!this.addNew) return;
      const { search } = this;
      // If there is a existing tag
      if (this.hasExactMatch) {
        this.selectItem(this.availableToSelect[0]);
        this.search = '';
      } else {
        // Creating a new tag as there is no existing tag present
        this.$emit('addNew', search);
        this.itemsAdded.push(search.toLowerCase());
        this.search = '';
      }
    },
  },
};
</script>
