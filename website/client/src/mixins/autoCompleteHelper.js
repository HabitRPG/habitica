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
    _getActiveAutocomplete () {
      if (this.$refs.autocomplete && this.$refs.autocomplete.searchActive) {
        return this.$refs.autocomplete;
      }
      if (this.$refs.emojiAutocomplete && this.$refs.emojiAutocomplete.searchActive) {
        return this.$refs.emojiAutocomplete;
      }
      return null;
    },

    autoCompleteMixinHandleTab (e) {
      const ac = this._getActiveAutocomplete();
      if (ac) {
        e.preventDefault();
        if (e.shiftKey) {
          ac.selectPrevious();
        } else {
          ac.selectNext();
        }
      }
    },

    autoCompleteMixinHandleEscape (e) {
      const ac = this._getActiveAutocomplete();
      if (ac) {
        e.preventDefault();
        ac.cancel();
      }
    },

    autoCompleteMixinSelectNextAutocomplete (e) {
      const ac = this._getActiveAutocomplete();
      if (ac) {
        e.preventDefault();
        ac.selectNext();
      }
    },

    autoCompleteMixinSelectPreviousAutocomplete (e) {
      const ac = this._getActiveAutocomplete();
      if (ac) {
        e.preventDefault();
        ac.selectPrevious();
      }
    },

    autoCompleteMixinSelectAutocomplete (e) {
      const ac = this._getActiveAutocomplete();
      if (ac) {
        if (ac.selected !== null) {
          e.preventDefault();
          ac.makeSelection();
        } else {
          ac.cancel();
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
