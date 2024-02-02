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
              <span :class="item.value ? 'achieved' : 'not-achieved'">
                {{ item.value }}
              </span>
              :
              {{ item.text || item.key }}
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
                    <span :class="item.value ? 'achieved' : 'not-achieved'">
                      {{ item.value }}
                    </span>
                    :
                    {{ item.text || item.key }}
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
  ul li {
    margin-bottom: 0.2em;
  }
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
import i18n from '@/../../common/script/i18n';
import saveHero from '../mixins/saveHero';

function getText (achievementItem) {
  if (achievementItem === undefined) {
    return '';
  }
  const { titleKey } = achievementItem;
  if (titleKey !== undefined) {
    return i18n.t(titleKey, 'en');
  }
  const { singularTitleKey } = achievementItem;
  if (singularTitleKey !== undefined) {
    return i18n.t(singularTitleKey, 'en');
  }
  return achievementItem.key;
}

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
        const valueIsInteger = self.integerTypes.includes(key);
        let text = nestedKey;
        if (allAchievements[key] && allAchievements[key][nestedKey]) {
          text = getText(allAchievements[key][nestedKey]);
        }
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
        text: getText(allAchievements[key]),
        modified: false,
        path: `${basePath}.${key}`,
        value: ownedAchievements[key],
        valueIsInteger,
      });
    }
  }

  for (const key of Object.keys(allAchievements)) {
    if (key !== '' && !key.endsWith('UltimateGear') && !key.endsWith('Quest')) {
      if (ownedAchievements[key] === undefined) {
        const valueIsInteger = self.integerTypes.includes(key);
        achievements.push({
          key,
          text: getText(allAchievements[key]),
          modified: false,
          path: `${basePath}.${key}`,
          value: valueIsInteger ? 0 : false,
          valueIsInteger,
          neverOwned: true,
        });
      }
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
