import { EVENTS } from '@/libs/events';

export const worldStateMixin = { // eslint-disable-line import/prefer-default-export
  methods: {
    async triggerGetWorldState (forceLoad = false) {
      if (forceLoad) {
        await this.$store.dispatch('worldState:getWorldState', { forceLoad: true });
      } else {
        await this.$store.dispatch('worldState:getWorldState');
      }

      this.$root.$emit(EVENTS.WORLD_STATE_LOADED);
    },
  },
};
