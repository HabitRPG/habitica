let emptyStats = {
  str: 0,
  int: 0,
  per: 0,
  con: 0,
};

export default {
  computed: {
    stats () {
      let classBonus = this.getClassBonus(this.item);

      let sumNewGearStats = this.calculateStats(this.item, classBonus, (a1, a2) => {
        return a1 + a2;
      });

      return {
        gear: this.item,
        classBonus,
        sum: sumNewGearStats,
      };
    },
  },
  methods: {
    getClassBonus (item) {
      let result = emptyStats;

      if (!item) {
        return result;
      }

      let userClass = this.user.stats.class;
      if (userClass === item.klass || userClass === item.specialClass) {
        for (let attr of this.ATTRIBUTES) {
          console.info(attr, item[attr], Number(item[attr]));
          result[attr] = Number(item[attr]) * 0.5;
        }
      }

      return result;
    },
    calculateStats (srcStats, otherStats, func) {
      let result = {};

      for (let attr of this.ATTRIBUTES) {
        result[attr] = func(Number(srcStats[attr]), Number(otherStats[attr]));
      }

      return result;
    },
  },
};
