<template lang="pug">
  #body.section.customize-section

    div {{ freeShirts }}
    .row.sub-menu.text-center
      .col-3.offset-3.sub-menu-item(@click='changeSubPage("size")', :class='{active: activeSubPage === "size"}')
        strong(v-once) {{$t('size')}}
      .col-3.sub-menu-item(@click='changeSubPage("shirt")', :class='{active: activeSubPage === "shirt"}')
        strong(v-once) {{$t('shirt')}}
    .row(v-if='activeSubPage === "size"')
      .col-12.customize-options.size-options
        .option(v-for='option in ["slim", "broad"]', :class='{active: user.preferences.size === option}')
          .sprite.customize-option(:class="`${option}_shirt_black`", @click='set({"preferences.size": option})')
    .row(v-if='activeSubPage === "shirt"')
      .col-12.customize-options
        .option(v-for='option in ["black", "blue", "green", "pink", "white", "yellow"]',
          :class='{active: user.preferences.shirt === option}')
          .sprite.customize-option(:class="`slim_shirt_${option}`", @click='set({"preferences.shirt": option})')
      .col-12.customize-options(v-if='editing')
        .option(v-for='item in specialShirts',
          :class='{active: item.active, locked: item.locked}')
          .sprite.customize-option(:class="`broad_shirt_${item.key}`", @click='item.click')
          .gem-lock(v-if='item.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("shirt", specialShirtKeys)')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`shirt.${specialShirtKeys.join(",shirt.")}`)') {{ $t('purchaseAll') }}
</template>

<script>

  import appearance from 'common/script/content/appearance';
  import {subPageMixin} from '../../mixins/subPage';

  const freeShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price === 0);
  const specialShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price !== 0);

  export default {
    mixins: [
      subPageMixin,
    ],
    data () {
      return {
        freeShirts: freeShirtKeys,
        specialShirts: specialShirtKeys,
      };
    },
    mounted () {
      this.changeSubPage('size');
    },
  };
</script>

<style scoped>

</style>
