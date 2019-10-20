<template>
  <div
    class="row"
    :class="{'small-version': smallVersion}"
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
          v-for="star of stars()"
          :key="star"
          class="svg-icon inline"
          :class="smallVersion ? 'icon-12' : 'icon-16'"
          v-html="icons[star]"
        ></div>
      </dd>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.row {
  display: table;
  margin: 0;
}

.table-row {
  display: table-row;
  margin-bottom: 4px;
}

dd {
  height: 24px;
  padding-left: 1em;
  padding-top: 3px;
  padding-bottom: 3px;
}

dt, dd {
  display: table-cell;
  vertical-align: middle;
}

dt, dd, dd > * {
  text-align: left;
}

dt {
  font-size: 1.3em;
  line-height: 1.2;
  color: $gray-50;
}

.svg-icon {
  margin-right: 4px;
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
.questPopover {
  dt {
    color: inherit;
    font-size: 1em;
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
  fill: #686274;
}

</style>

<script>
import svgStar from '@/assets/svg/difficulty-star.svg';
import svgStarHalf from '@/assets/svg/difficulty-star-half.svg';
import svgStarEmpty from '@/assets/svg/difficulty-star-empty.svg';

export default {
  props: {
    quest: {
      type: Object,
    },
    smallVersion: {
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
