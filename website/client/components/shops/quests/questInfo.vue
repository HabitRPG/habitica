<template lang="pug">
  div.row
    span.col-4(v-if="quest.collect") {{ $t('collect') + ':' }}
    span.col-8(v-if="quest.collect")
      div(v-for="(collect, key) of quest.collect")
        span {{ collect.count }} {{ getCollectText(collect) }}

    span.col-4(v-if="quest.boss") {{ $t('bossHP') + ':' }}
    span.col-8(v-if="quest.boss") {{ quest.boss.hp }}

    span.col-4 {{ $t('difficulty') + ':' }}
    span.col-8
      span.svg-icon.inline.icon-16(v-for="star of stars()", v-html="icons[star]")
</template>
<style lang="scss" scoped>

  @import '~client/assets/scss/colors.scss';

  .col-4{
    text-align: left;
    font-weight: bold;
    white-space: nowrap;
    height: 16px;
    width: 80px;
  }

  .col-8 {
    text-align: left;
  }

  .col-8:not(:last-child) {
    margin-bottom: 4px;
  }

  span.svg-icon.inline.icon-16 {
    margin-right: 4px;
  }
</style>

<script>
  import svgStar from 'assets/svg/difficulty-star.svg';
  import svgStarHalf from 'assets/svg/difficulty-star-half.svg';
  import svgStarEmpty from 'assets/svg/difficulty-star-empty.svg';

  export default {
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
    props: {
      quest: {
        type: Object,
      },
    },
  };
</script>
