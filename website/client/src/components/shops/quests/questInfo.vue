<template>
  <div>
    <div
      class="row"
    >
      <div
        v-if="quest.collect"
        class="table-row"
      >
        <dt>{{ $t('collect') + ':' }}</dt>
        <dd>
          <div
            v-for="(collect, key) of quest.collect"
            :key="key"
          >
            <span>{{ collect.count }} {{ getCollectText(collect) }}</span>
          </div>
        </dd>
      </div>
      <div
        v-if="quest.boss"
        class="table-row"
      >
        <dt>{{ $t('bossHP') + ':' }}</dt>
        <dd>{{ quest.boss.hp }}</dd>
      </div>
      <div class="table-row">
        <dt>{{ $t('difficulty') + ':' }}</dt>
        <dd>
          <div
            v-for="(star, index) of stars()"
            :key="index"
            class="svg-icon inline icon-16"
            v-html="icons[star]"
          ></div>
        </dd>
      </div>
    </div>
    <div v-if="quest.event && popoverVersion">
      {{ limitedString }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.row {
  display: table;
  margin: 0;
  width: 100%;
}

.table-row {
  display: table-row;
  margin-bottom: 4px;
  font-size: 14px;
  height: 1.5rem;
}

dd {
  padding-left: 1em;
  text-align: right;
}

dt, dd {
  display: table-cell;
  vertical-align: middle;
  height: 16px;
  max-height: 16px;
}

dt {
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: left;
  color: $gray-50;
}

.svg-icon {
  margin-left: 4px;
}

.small-version {
  font-size: 12px;
  line-height: 1.33;

  .svg-icon {
    margin-top: 1px;
  }
}
</style>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

.questPopover {
  dt {
    color: inherit;
    white-space: nowrap;
  }
}

// popover used in quest selection modal
.popover-body {
  dt {
    color: inherit;
  }
}

// making sure the star-colors always correct
.star {
  fill: #ffb445;
}
.star-empty {
  fill: $gray-400;
}

</style>

<script>
import moment from 'moment';

import svgStar from '@/assets/svg/difficulty-star.svg';
import svgStarHalf from '@/assets/svg/difficulty-star-half.svg';
import svgStarEmpty from '@/assets/svg/difficulty-star-empty.svg';

import seasonalShopConfig from '@/../../common/script/libs/shops-seasonal.config';

export default {
  props: {
    quest: {
      type: Object,
    },
    popoverVersion: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        star: svgStar,
        starHalf: svgStarHalf,
        starEmpty: svgStarEmpty,
      }),
    };
  },
  computed: {
    difficulty () {
      if (this.quest.boss) {
        return this.quest.boss.str;
      }

      return 1;
    },
    limitedString () {
      return this.$t('limitedOffer', { date: moment(seasonalShopConfig.dateRange.end).format('LL') });
    },
  },
  methods: {
    stars () {
      const result = [];
      const { difficulty } = this;

      for (let i = 1; i <= 4; i += 1) {
        const diff = difficulty - i;

        if (diff >= 0) {
          result.push('star');
        } else if (diff <= -1) {
          result.push('starEmpty');
        } else {
          result.push('starHalf');
        }
      }

      return result;
    },
    getCollectText (collect) {
      if (collect.text instanceof Function) {
        return collect.text();
      }
      return collect.text;
    },
  },
};
</script>
