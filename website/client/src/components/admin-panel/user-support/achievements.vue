<template>
  <div class="card mt-2">
    <div class="card-header">
      <h3
        class="mb-0 mt-0"
        :class="{'open': expand}"
        @click="expand = !expand"
      >
        Achievements
      </h3>
    </div>
    <div
      v-if="expand"
      class="card-body"
    >
      <ul>
        <li
          v-for="item in achievements"
          :key="item.path"
          v-b-tooltip.hover="item.notes"
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
              {{ item.text || item.key }} - <i> {{ item.key }} </i>
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
                v-b-tooltip.hover="item.notes"
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
                    {{ item.text || item.key }} - <i> {{ item.key }} </i>
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
    return i18n.t(titleKey);
  }
  const { singularTitleKey } = achievementItem;
  if (singularTitleKey !== undefined) {
    return i18n.t(singularTitleKey);
  }
  return achievementItem.key;
}

function getNotes (achievementItem, count) {
  if (achievementItem === undefined) {
    return '';
  }
  const { textKey } = achievementItem;
  if (textKey !== undefined) {
    return i18n.t(textKey, { count });
  }
  const { singularTextKey } = achievementItem;
  if (singularTextKey !== undefined) {
    return i18n.t(singularTextKey, { count });
  }
  return '';
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
        'valentine', 'congrats', 'shinySeed', 'goodluck', 'thankyou', 'seafoam', 'snowball', 'quests',
        'rebirths', 'rebirthLevel', 'greeting', 'spookySparkles', 'nye', 'costumeContests', 'congrats',
        'getwell', 'beastMasterCount', 'mountMasterCount', 'triadBingoCount',
      ],
      cardTypes: ['greeting', 'birthday', 'valentine', 'goodluck', 'thankyou', 'greeting', 'nye',
        'congrats', 'getwell'],
      achievements: [],
      nestedAchievements: {},
    };
  },
  watch: {
    resetCounter () {
      this.resetData();
    },
  },
  mounted () {
    this.resetData();
  },
  methods: {
    async saveItem (item) {
      await this.saveHero({
        hero: {
          _id: this.hero._id,
          achievementPath: item.path,
          achievementVal: item.value,
        },
        msg: item.path,
      });
      item.modified = false;
    },
    enableValueChange (item) {
      // allow form field(s) to be shown:
      item.modified = true;
      if (!item.valueIsInteger) {
        item.value = !item.value;
      }
    },
    resetData () {
      this.collateItemData();
      this.nestedAchievementKeys.forEach(itemType => { this.expandItemType[itemType] = false; });
    },
    collateItemData () {
      const achievements = [];
      const nestedAchievements = {};
      const basePath = 'achievements';
      const ownedAchievements = this.hero.achievements;
      const allAchievements = content.achievements;

      const ownedKeys = Object.keys(ownedAchievements).sort();
      for (const key of ownedKeys) {
        const value = ownedAchievements[key];
        let contentKey = key;
        if (this.cardTypes.indexOf(key) !== -1) {
          contentKey += 'Cards';
        }
        if (typeof value === 'object') {
          nestedAchievements[key] = [];
          for (const nestedKey of Object.keys(value)) {
            const valueIsInteger = this.integerTypes.includes(key);
            let text = nestedKey;
            if (allAchievements[key] && allAchievements[key][contentKey]) {
              text = getText(allAchievements[key][contentKey]);
            }
            let notes = '';
            if (allAchievements[key] && allAchievements[key][contentKey]) {
              notes = getNotes(allAchievements[key][contentKey], ownedAchievements[key]);
            }
            nestedAchievements[key].push({
              key: nestedKey,
              text,
              notes,
              achievementType: key,
              modified: false,
              path: `${basePath}.${key}.${nestedKey}`,
              value: value[nestedKey],
              valueIsInteger,
            });
          }
        } else {
          const valueIsInteger = this.integerTypes.includes(key);
          achievements.push({
            key,
            text: getText(allAchievements[contentKey]),
            notes: getNotes(allAchievements[contentKey], ownedAchievements[key]),
            modified: false,
            path: `${basePath}.${key}`,
            value: ownedAchievements[key],
            valueIsInteger,
          });
        }
      }

      const allKeys = Object.keys(allAchievements).sort();

      for (const key of allKeys) {
        if (key !== '' && !key.endsWith('UltimateGear') && !key.endsWith('Quest')) {
          const ownedKey = key.replace('Cards', '');
          if (ownedAchievements[ownedKey] === undefined) {
            const valueIsInteger = this.integerTypes.includes(ownedKey);
            achievements.push({
              key: ownedKey,
              text: getText(allAchievements[key]),
              notes: getNotes(allAchievements[key], 0),
              modified: false,
              path: `${basePath}.${ownedKey}`,
              value: valueIsInteger ? 0 : false,
              valueIsInteger,
              neverOwned: true,
            });
          }
        }
      }

      this.achievements = achievements;
      this.nestedAchievements = nestedAchievements;
    },
  },
};
</script>
