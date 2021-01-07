import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState({
      currentEvent: 'worldState.data.currentEvent',
    }),
  },
  methods: {
    npcClass (name) {
      if (!this.currentEvent || !this.currentEvent.season) return `npc_${name}`;
      return `npc_${name} npc_${name}_${this.currentEvent.season}`;
    },
  },
};
