<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Current Avatar Appearance, Drop Count Today
    </h3>
    <div v-if="expand">
      <div>Drops Today: {{ items.lastDrop.count }}</div>
      <div>Most Recent Drop: {{ items.lastDrop.date | formatDate }}</div>
      <div>Use Costume: {{ preferences.costume ? 'on' : 'off' }}</div>
      <div class="subsection-start">
        Equipped Gear:
        <ul v-html="formatEquipment(items.gear.equipped)"></ul>
      </div>
      <div>
        Costume:
        <ul v-html="formatEquipment(items.gear.costume)"></ul>
      </div>
    </div>
  </div>
</template>

<script>
import filters from '../mixins/filters';
import formatItems from '../mixins/formatItems';

export default {
  mixins: [
    filters,
    formatItems,
  ],
  props: {
    items: {
      type: Object,
      required: true,
    },
    preferences: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
  methods: {
    formatEquipment (gearWorn) {
      const gearTypes = ['head', 'armor', 'weapon', 'shield', 'headAccessory', 'eyewear',
        'body', 'back'];
      let equipmentList = '';
      gearTypes.forEach(gearType => {
        const key = gearWorn[gearType] || '';
        const description = (key)
          ? `<strong>${key}</strong> : ${this.getItemDescription('gear', gearWorn[gearType])}`
          : 'none';
        equipmentList += `<li>${gearType} : ${description}</li>\n`;
      });
      return equipmentList;
    },
  },
};
</script>
