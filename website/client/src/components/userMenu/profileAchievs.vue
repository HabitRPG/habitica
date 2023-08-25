<template>
  <div
    v-show="selectedPage === 'achievements'"
    v-if="user.achievements"
    id="achievements"
    class="standard-page container "
  >
    <div
      v-for="(category, key) in achievements"
      :key="key"
      class="row category-row"
    >
      <h3 class="text-center">
        {{ $t(`${key}Achievs`) }}
      </h3>
      <div class="">
        <div class="row achievements-row justify-content-center">
          <div
            v-for="(achievement, achievKey) in achievementsCategory(key, category)"
            :key="achievKey"
            class="achievement-wrapper col text-center"
          >
            <div
              :id="achievKey + '-achievement'"
              class="box achievement-container"
              :class="{'achievement-unearned': !achievement.earned}"
            >
              <b-popover
                :target="'#' + achievKey + '-achievement'"
                triggers="hover"
                placement="top"
              >
                <h4 class="popover-content-title">
                  {{ achievement.title }}
                </h4>
                <div
                  class="popover-content-text"
                  v-html="achievement.text"
                ></div>
              </b-popover>
              <div
                v-if="achievement.earned"
                class="achievement"
                :class="achievement.icon + '2x'"
              >
                <div
                  v-if="achievement.optionalCount"
                  class="counter badge badge-pill stack-count"
                >
                  {{ achievement.optionalCount }}
                </div>
              </div>
              <div
                v-if="!achievement.earned"
                class="achievement achievement-unearned achievement-unearned2x"
              ></div>
            </div>
          </div>
        </div>
        <div
          v-if="achievementsCategories[key].number > 5"
          class="btn btn-flat btn-show-more"
          @click="toggleAchievementsCategory(key)"
        >
          {{ achievementsCategories[key].open ?
            $t('hideAchievements', {category: $t(`${key}Achievs`)}) :
            $t('showAllAchievements', {category: $t(`${key}Achievs`)})
          }}
        </div>
      </div>
    </div>
    <hr class="">
    <div class="row">
      <div
        v-if="user.achievements.challenges"
        class="col-12 col-md-6"
      >
        <div class="achievement-icon achievement-karaoke-2x"></div>
        <h3 class="text-center">
          {{ $t('challengesWon') }}
        </h3>
        <div
          v-for="chal in user.achievements.challenges"
          :key="chal"
          class="achievement-list-item"
        >
          <span v-markdown="chal"></span>
        </div>
      </div>
      <div
        v-if="user.achievements.quests"
        class="col-12 col-md-6"
      >
        <div class="achievement-icon achievement-alien2x"></div>
        <h3 class="text-center">
          {{ $t('questsCompleted') }}
        </h3>
        <div
          v-for="(value, key) in user.achievements.quests"
          :key="key"
          class="achievement-list-item d-flex justify-content-between"
        >
          <span>{{ content.quests[key].text() }}</span>
          <span
            v-if="value > 1"
            class="badge badge-pill stack-count"
          >
            {{ value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  #achievements {
    .category-row {
      margin-bottom: 34px;
      justify-content: center;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    .achievements-row {
      margin: 0 auto;
      max-width: 590px;
    }

    .achievement-wrapper {
      margin-left: 12px;
      margin-right: 12px;
      max-width: 94px;
      min-width: 94px;
      padding: 0px;
      width: 94px;
    }

    .box {
      background: $white;
      margin: 0 auto;
      margin-bottom: 16px;
      padding-top: 20px;
    }

    hr {
      margin-bottom: 48px;
      margin-top: 48px;
    }

    .box.achievement-unearned {
      background-color: $gray-600;
    }

    .counter.badge {
      background-color: $orange-100;
      color: $white;
      max-height: 24px;
      position: absolute;
      right: -8px;
      top: -12.8px;
    }

    .achievement-icon {
      margin: 0 auto;
    }

    .achievement-list-item {
      border-top: 1px solid $gray-500;
      padding-bottom: 12px;
      padding-top: 11px;

      &:last-child {
        border-bottom: 1px solid $gray-500;
      }

      .badge {
        background: $gray-600;
        color: $gray-300;
        height: fit-content;
        margin-right: 8px;
      }
    }
  }
</style>
