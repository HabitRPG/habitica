let emptyStats = () => {
  return {
    str: 0,
    int: 0,
    per: 0,
    con: 0,
  };
};

export default {
  computed: {
    stats () {
      let gearStats = this.getItemStats(this.item);
      let classBonus = this.getClassBonus(this.item);

      let sumNewGearStats = this.calculateStats(gearStats, classBonus, (a1, a2) => {
        return a1 + a2;
      });

      return {
        gear: gearStats,
        classBonus,
        sum: sumNewGearStats,
      };
    },
  },
  methods: {
    getItemStats (item) {
      let result = emptyStats();

      if (!item) {
        return result;
      }

      for (let attr of this.ATTRIBUTES) {
        result[attr] = Number(item[attr]);
      }

      return result;
    },
    getClassBonus (item) {
      let result = emptyStats();

      if (!item) {
        return result;
      }

      let itemStats = this.getItemStats(item);

      let userClass = this.user.stats.class;
      if (userClass === item.klass || userClass === item.specialClass) {
        for (let attr of this.ATTRIBUTES) {
          result[attr] = itemStats[attr] * 0.5;
        }
      }

      return result;
    },
    calculateStats (srcStats, otherStats, func) {
      let result = emptyStats();

      for (let attr of this.ATTRIBUTES) {
        result[attr] = func(srcStats[attr], otherStats[attr]);
      }

      return result;
    },
  },
};
