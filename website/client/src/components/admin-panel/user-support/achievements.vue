<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Achievements
    </h3>
    <div v-if="expand">
      <ul>
              <li
                v-for="item in achievements"
                :key="item.path"
              >
                <form @submit.prevent="saveItem(item)">
                  <span
                    class="enableValueChange"
                    @click="enableValueChange(item)"
                  >
                    {{ item.key }}
                    :
                    <span :class="item.value ? 'achieved' : 'not-achieved'">
                      {{ item.value }}
                    </span>
                  </span>

                  <div
                    v-if="item.modified"
                    class="form-inline"
                  >
                    <input
                      v-if="item.valueIsInteger"
                      v-model="item.value"
                      class="form-control valueField"
                      type="number"
                    >
                    <input
                      v-if="item.modified"
                      type="submit"
                      value="Save"
                      class="btn btn-primary"
                    >
                  </div>
                </form>
              </li>
            </ul>
      <div
        v-for="achievementType in nestedAchievementKeys"
        :key="achievementType"
      >
        <div class="accordion-group">
          <h4
            class="expand-toggle"
            :class="{'open': expandItemType[achievementType]}"
            @click="expandItemType[achievementType] = !expandItemType[achievementType]"
          >
            {{ achievementType }}
          </h4>

          <div v-if="expandItemType[achievementType]">
            <ul>
              <li
                v-for="item in nestedAchievements[achievementType]"
                :key="item.path"
              >
                <form @submit.prevent="saveItem(item)">
                  <span
                    class="enableValueChange"
                    @click="enableValueChange(item)"
                  >
                    {{ item.text || item.key }}
                    :
                    <span :class="item.value ? 'achieved' : 'not-achieved'">
                      {{ item.value }}
                    </span>
                  </span>

                  <div
                    v-if="item.modified"
                    class="form-inline"
                  >
                    <input
                      v-if="item.valueIsInteger"
                      v-model="item.value"
                      class="form-control valueField"
                      type="number"
                    >
                    <input
                      v-if="item.modified"
                      type="submit"
                      value="Save"
                      class="btn btn-primary"
                    >
                  </div>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .ownedItem {
    font-weight: bold;
  }
  .enableValueChange:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  .valueField {
    min-width: 10ch;
  }

  .achieved {
    color: green;
  }

  .not-achieved {
    color: red;
  }
</style>

<script>
import content from '@/../../common/script/content';
import saveHero from '../mixins/saveHero';

function collateItemData (self) {
  const achievements = [];
  const nestedAchievements = {};
  const basePath = 'achievements';
  const ownedAchievements = self.hero.achievements;
  const allAchievements = content.achievements;

  for (const key of Object.keys(ownedAchievements)) {
    const value = ownedAchievements[key];
    if (typeof value === 'object') {
      nestedAchievements[key] = [];
      for (const nestedKey of Object.keys(value)) {
        let text = nestedKey;
        if (allAchievements[key] && allAchievements[key][nestedKey]) {
          text = allAchievements[key][nestedKey].text;
        }
        const valueIsInteger = self.integerTypes.includes(key);
        nestedAchievements[key].push({
          key: nestedKey,
          text,
          achievementType: key,
          modified: false,
          path: `${basePath}.${key}.${nestedKey}`,
          value: value[nestedKey],
          valueIsInteger,
        });
      }
    } else {
      const valueIsInteger = self.integerTypes.includes(key);
      achievements.push({
        key,
        text: allAchievements[key],
        modified: false,
        path: `${basePath}.${key}`,
        value: ownedAchievements[key],
        valueIsInteger,
      });
    }
  }

  for (const key of Object.keys(allAchievements)) {
    console.log(key);
    console.log(ownedAchievements[key]);
    if (ownedAchievements[key] === undefined) {
      const valueIsInteger = self.integerTypes.includes(key);
      achievements.push({
        key,
        text: allAchievements[key],
        modified: false,
        path: `${basePath}.${key}`,
        value: valueIsInteger ? 0 : false,
        valueIsInteger,
        neverOwned: true,
      });
    }
  }

  self.achievements = achievements;
  self.nestedAchievements = nestedAchievements;
}

function resetData (self) {
  collateItemData(self);
  self.nestedAchievementKeys.forEach(itemType => { self.expandItemType[itemType] = false; });
}

export default {
  mixins: [
    saveHero,
  ],
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
      expandItemType: {
        quests: false,
        ultimateGearSets: false,
      },
      nestedAchievementKeys: ['quests', 'ultimateGearSets'],
      integerTypes: ['streak', 'perfect', 'birthday', 'habiticaDays', 'habitSurveys', 'habitBirthdays',
        'valentine', 'congrats', 'shinySeed', 'goodluck', 'thankyou', 'seafoam', 'snowball', 'quests'],
      achievements: [],
      nestedAchievements: {},
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
  methods: {
    async saveItem (item) {
      // prepare the item's new value and path for being saved
      this.hero.achievementPath = item.path;
      this.hero.achievementVal = item.value;

      await this.saveHero({ hero: this.hero, msg: item.path });
      item.modified = false;
    },
    enableValueChange (item) {
      // allow form field(s) to be shown:
      item.modified = true;
      if (!item.valueIsInteger) {
        item.value = !item.value;
      }
    },
  },
};
</script>
