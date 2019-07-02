<template lang="pug">
  .customize-options
    .option(v-for='option in items',
      :key='option.key',
      :class='{active: currentValue === option.key, none: option.none}'
    )
      .sprite.customize-option(:class='option.class', @click='set({[propertyToChange]: option.key})')
        .gem-lock(v-if='option.locked')
          .svg-icon.gem(v-html='icons.gem')
          span {{ option.gem }}
        .redline-outer(v-if="option.none")
          .redline
</template>

<script>
  import gem from 'assets/svg/gem.svg';
  import {avatarEditorUtilies} from '../../mixins/avatarEditUtilities';

  export default {
    props: ['items', 'propertyToChange', 'currentValue'],
    mixins: [
      avatarEditorUtilies,
    ],
    data () {
      return {
        icons: Object.freeze({
          gem,
        }),
      };
    },
  };
</script>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .option {
    display: inline-block;
    vertical-align: bottom;
    //padding: .5em;
    height: 64px;
    width: 64px;
    margin: 1em .5em .5em 0;
    border: 4px solid $gray-700;
    border-radius: 10px;
    position: relative;

    &.none {
      .sprite {
        opacity: 0.24;
      }

      .redline-outer {
        height: 60px;
        width: 60px;
        position: absolute;
        bottom: 0;
        margin: 0 auto 0 0;

        .redline {
          width: 60px;
          height: 4px;
          display: block;
          background: red;
          transform: rotate(-45deg);
          position: absolute;
          top: 0;

          margin-top: 10px;
          margin-bottom: 20px;
          margin-left: 6px;
        }
      }
    }

    &.locked {
      border: none;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      margin-top: 0;
    }

    &.active {
      background: white;
      border: solid 4px $purple-300;
    }

    &:hover {
      cursor: pointer;
    }

    .sprite.customize-option {
      // margin: 0 auto;
      margin-left: -3px;
      margin-top: -7px;

      &.color-bangs {
        margin-top: 3px;
      }
      &.skin {
        margin-top: -3px;
      }
    }
  }

</style>
