/* eslint-disable camelcase */

import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({
      openedItemRows: 'openedItemRows',
    }),
  },
  methods: {
    $_openedItemRows_toggleByType (typeId, add) {
      let array = this.$store.state.openedItemRows;

      if (add) {
        array.push(typeId);
      } else {
        let index = array.indexOf(typeId);

        if (index > -1) {
          array.splice(index, 1);
        }
      }
    },
    $_openedItemRows_isToggled (typeId) {
      return this.openedItemRows.includes(typeId);
    },
  },
};
