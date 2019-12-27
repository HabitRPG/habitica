const emptyStats = () => ({
  str: 0,
  int: 0,
  per: 0,
  con: 0,
});

export default {
  computed: {
    stats () {
      const gearStats = this.getItemStats(this.item);
      const classBonus = this.getClassBonus(this.item);

      const sumNewGearStats = this.calculateStats(gearStats, classBonus, (a1, a2) => a1 + a2);

      return {
        gear: gearStats,
        classBonus,
        sum: sumNewGearStats,
      };
    },
  },
  methods: {
    getItemStats (item) {
      const result = emptyStats();

      if (!item) {
        return result;
      }

      for (const attr of this.ATTRIBUTES) {
        result[attr] = Number(item[attr]);
      }

      return result;
    },
    getClassBonus (item) {
      const result = emptyStats();

      if (!item) {
        return result;
      }

      const itemStats = this.getItemStats(item);

      const userClass = this.user.stats.class;
      if (userClass === item.klass || userClass === item.specialClass) {
        for (const attr of this.ATTRIBUTES) {
          result[attr] = itemStats[attr] * 0.5;
        }
      }

      return result;
    },
    calculateStats (srcStats, otherStats, func) {
      const result = emptyStats();

      for (const attr of this.ATTRIBUTES) {
        result[attr] = func(srcStats[attr], otherStats[attr]);
      }

      return result;
    },
  },
};
