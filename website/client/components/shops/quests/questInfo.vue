<template lang="pug">
.row(:class="{'small-version': smallVersion}")
  dl
  template(v-if="quest.collect")
    dt(:class="smallVersion ? 'col-3' : 'col-4'") {{ $t('collect') + ':' }}
    dd.col-8
      div(v-for="(collect, key) of quest.collect")
        span {{ collect.count }} {{ getCollectText(collect) }}

  template(v-if="quest.boss")
    dt(:class="smallVersion ? 'col-3' : 'col-4'") {{ $t('bossHP') + ':' }}
    dd.col-8 {{ quest.boss.hp }}

  dt(:class="smallVersion ? 'col-3' : 'col-4'") {{ $t('difficulty') + ':' }}
  dd.col-8
    .svg-icon.inline(
      v-for="star of stars()", v-html="icons[star]",
      :class="smallVersion ? 'icon-12' : 'icon-16'",
    )
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

dt {
  font-size: 1.3em;
  line-height: 1.2;
  color: $gray-50;
}

.col-8 {
  text-align: left;
}

.col-8:not(:last-child) {
  margin-bottom: 4px;
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
