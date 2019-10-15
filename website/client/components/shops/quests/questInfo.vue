<template lang="pug">
.row(:class="{'small-version': smallVersion}")
  .table-row(v-if="quest.collect")
    dt {{ $t('collect') + ':' }}
    dd
      div(v-for="(collect, key) of quest.collect")
        span {{ collect.count }} {{ getCollectText(collect) }}

  .table-row(v-if="quest.boss")
    dt {{ $t('bossHP') + ':' }}
    dd {{ quest.boss.hp }}

  .table-row
    dt {{ $t('difficulty') + ':' }}
    dd
      .svg-icon.inline(
        v-for="star of stars()", v-html="icons[star]",
        :class="smallVersion ? 'icon-12' : 'icon-16'",
      )
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

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
  import svgStar from 'assets/svg/difficulty-star.svg';
  import svgStarHalf from 'assets/svg/difficulty-star-half.svg';
  import svgStarEmpty from 'assets/svg/difficulty-star-empty.svg';

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
        let result = [];
        let difficulty = this.difficulty;

        for (let i = 1; i <= 4; i++) {
          let diff = difficulty - i;

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
        } else {
          return collect.text;
        }
      },
    },
  };
</script>
