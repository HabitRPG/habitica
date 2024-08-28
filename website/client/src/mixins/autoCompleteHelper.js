import debounce from 'lodash/debounce';

export const autoCompleteHelperMixin = {
  data () {
    return {
      mixinData: {
        autoComplete: {
          caretPosition: 0,
          coords: {
            TOP: 0,
            LEFT: 0,
          },
        },
      },
    };
  },
  methods: {
    autoCompleteMixinHandleTab (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        if (e.shiftKey) {
          this.$refs.autocomplete.selectPrevious();
        } else {
          this.$refs.autocomplete.selectNext();
        }
      }
    },

    autoCompleteMixinHandleEscape (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.cancel();
      }
    },

    autoCompleteMixinSelectNextAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.selectNext();
      }
    },

    autoCompleteMixinSelectPreviousAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        e.preventDefault();
        this.$refs.autocomplete.selectPrevious();
      }
    },

    autoCompleteMixinSelectAutocomplete (e) {
      if (this.$refs.autocomplete.searchActive) {
        if (this.$refs.autocomplete.selected !== null) {
          e.preventDefault();
          this.$refs.autocomplete.makeSelection();
        } else {
          // no autocomplete selected, newline instead
          this.$refs.autocomplete.cancel();
        }
      }
    },

    autoCompleteMixinUpdateCarretPosition: debounce(function updateCarretPosition (eventUpdate) {
      this._updateCarretPosition(eventUpdate);
    }, 250),

    autoCompleteMixinResetCoordsPosition () {
      this.mixinData.autoComplete.coords = {
        TOP: 0,
        LEFT: 0,
      };
    },

    // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
    _getCoord (e, text) {
      const caretPosition = text.selectionEnd;
      this.mixinData.autoComplete.caretPosition = caretPosition;

      const div = document.createElement('div');
      const span = document.createElement('span');
      const copyStyle = getComputedStyle(text);

      [].forEach.call(copyStyle, prop => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      document.body.appendChild(div);
      div.textContent = text.value.substr(0, caretPosition);
      span.textContent = text.value.substr(caretPosition) || '.';
      div.appendChild(span);
      this.mixinData.autoComplete.coords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    _updateCarretPosition (eventUpdate) {
      const text = eventUpdate.target;
      this._getCoord(eventUpdate, text);
    },
  },
};
