<template>
  <div>
    <b-dropdown
      ref="dropdown"
      class="inline-dropdown select-multi"
      :toggle-class="isOpened ? 'active' : null"
      :class="{'margin-adjust': selectedItem}"
      @show="wasOpened()"
      @hide="hideCallback($event)"
      @toggle="openOrClose($event)"
    >
      <b-dropdown-header>
        <div class="mb-2">
          <b-form-input
            v-model="search"
            type="text"
            :placeholder="searchPlaceholder"
            @keyup.enter="handleSubmit"
          />
        </div>
      </b-dropdown-header>
      <template v-slot:button-content>
        <div
          class="mr-1 d-inline-flex align-items-center"
          @click.stop="selectItem({id: selectedItem})"
          v-markdown="
            allItemsMap[selectedItem] ? `@${allItemsMap[selectedItem].name}`
            : emptyMessage
          "
        >
        </div>
      </template>
      <div
        v-if="addNew || availableToSelect.length > 0"
        :class="{
          'item-group': true,
          'add-new': availableToSelect.length === 0 && search !== '',
          'scroll': availableToSelect.length > 5
        }"
      >
        <b-dropdown-item-button
          v-for="item in availableToSelect"
          :key="item.id"
          class="ignore-hide multi-item"
          :class="{ 'none': item.id === 'none', selectListItem: true }"
          @click.prevent.stop="selectItem(item)"
        >
          <div
            v-markdown="item.name"
            class="label"
          ></div>
          <div
            v-if="item.addlText"
            class="addl-text"
          >
            {{ item.addlText }}
          </div>
        </b-dropdown-item-button>
      </div>
    </b-dropdown>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  $itemHeight: 2rem;

  .selected-item {
    display: inline-block;
    height: 1.5rem;
    border-radius: 100px;
    background-color: $white;
    border: solid 1px $gray-400;
    position: relative;
    top: -1px;

    .multi-label {
      height: 1rem;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: normal;
      color: $gray-100;
    }
  }

  .select-multi {
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
        height: 30px;

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
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
  },
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
    searchPlaceholder: {
      type: String,
    },
    selectedItem: {
      type: String,
    },
  },
  data () {
    return {
      preventHide: true,
      isOpened: false,
      selected: this.selectedItem,
      search: '',
    };
  },
  computed: {
    allItemsMap () {
      const obj = {};
      this.allItems.forEach(t => {
        obj[t.id] = t;
      });
      return obj;
    },
    selectedItemAsObject () {
      return this.selectedItem ? this.allItemsMap[this.selectedItem] : null;
    },
    availableToSelect () {
      const searchString = this.search.toLowerCase();

      const filteredItems = this.allItems.filter(i => i.name.toLowerCase().includes(searchString));

      return filteredItems;
    },
  },
  watch: {
    selected () {
      this.$emit('changed', this.selectedItem);
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
      Vue.nextTick(() => {
        this.$refs.dropdown.hide();
      });
    },
    openOrClose ($event) {
      if (this.isOpened) {
        this.closeSelectPopup();
        $event.preventDefault();
      }
    },
    selectItem (item) {
      if (item.id === this.selectedItem) {
        this.$emit('toggle', null);
      } else {
        this.$emit('toggle', item.id);
      }
      this.closeSelectPopup();
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
      this.preventHide = true;
    },
    handleEsc (e) {
      if (e.keyCode === 27) {
        this.closeSelectPopup();
      }
    },
    handleSubmit () {
      if (!this.addNew) return;
      const { search } = this;
      this.$emit('addNew', search);

      this.search = '';
    },
  },
};
</script>
