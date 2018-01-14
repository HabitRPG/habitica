<template lang="pug">
.row
  buy-gems-modal(v-if='user')
  modify-inventory(v-if="isUserLoaded")
  footer.col-12(:class="{expanded: isExpandedFooter}")
    .row(v-if="isExpandedFooter")
      .col-12.col-md-2
        h3
          a(href='https://itunes.apple.com/us/app/habitica/id994882113?ls=1&mt=8', target='_blank') {{ $t('mobileIOS') }}
        h3
          a(href='https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica', target='_blank') {{ $t('mobileAndroid') }}
      .col-12.col-md-2
        h3 Company
        ul
          li
           router-link(to='/static/features') {{ $t('companyAbout') }}
          li
            a(href='https://habitica.wordpress.com/', target='_blank') {{ $t('companyBlog') }}
          li
            a(href='http://blog.habitrpg.com/', target='_blank') {{ $t('tumblr') }}
          li
           router-link(to='/static/faq') {{ $t('FAQ') }}
          li
            a(href='http://habitica.wikia.com/wiki/Whats_New', target='_blank') {{ $t('oldNews') }}
          li
           router-link(to='/static/merch') {{ $t('merch') }}
          li
           router-link(to='/static/press-kit') {{ $t('presskit') }}
          li
           router-link(to='/static/contact') {{ $t('contactUs') }}
      .col-12.col-md-2
        h3 Community
        ul
          li
            a(target="_blanck", href="/static/community-guidelines") {{ $t('communityGuidelines') }}
          li
            router-link(to='/hall/contributors') {{ $t('hall') }}
          li
            router-link(to='/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac') {{ $t('reportBug') }}
          li
            a(href='https://trello.com/c/odmhIqyW/440-read-first-table-of-contents', target='_blank') {{ $t('requestFeature') }}
          li
            a(v-html='$t("communityExtensions")')
          li
            a(v-html='$t("communityForum")')
          li
            a(href='https://www.facebook.com/Habitica', target='_blank') {{ $t('communityFacebook') }}
          li
            a(href='https://www.reddit.com/r/habitrpg/', target='_blank') {{ $t('communityReddit') }}
      .col-12.col-md-6
        .row
          .col-6
            h3 Developers
            ul
              li
                a(href='/apidoc', target='_blank') {{ $t('APIv3') }}
              li
                a(:href="getDataDisplayToolUrl", target='_blank') {{ $t('dataDisplayTool') }}
              li
                a(href='http://habitica.wikia.com/wiki/Guidance_for_Blacksmiths', target='_blank') {{ $t('guidanceForBlacksmiths') }}
              li
                a(href='http://devs.habitica.com/', target='_blank') {{ $t('devBlog') }}
          .col-6.social
            h3 {{ $t('footerSocial') }}
            a.social-circle(href='https://twitter.com/habitica', target='_blank')
              .social-icon.svg-icon(v-html='icons.twitter')
            // TODO: Not ready yet. a.social-circle(href='https://www.instagram.com/habitica/', target='_blank')
              .social-icon.svg-icon.instagram(v-html='icons.instagram')
            a.social-circle(href='https://www.facebook.com/Habitica', target='_blank')
              .social-icon.facebook.svg-icon(v-html='icons.facebook')
        .row
          .col-12.col-md-10 {{ $t('donateText3') }}
          .col-12.col-md-2
            button.btn.btn-contribute(@click="donate()", v-if="user")
              .svg-icon.heart(v-html="icons.heart")
              .text {{ $t('companyDonate') }}
            .btn.btn-contribute(v-else)
              a(href='http://habitica.wikia.com/wiki/Contributing_to_Habitica', target='_blank')
                .svg-icon.heart(v-html="icons.heart")
                .text {{ $t('companyContribute') }}
    .row
      .col-12
        hr
    .row
      .col-12.col-md-5
        | © 2017 Habitica. All rights reserved.
        .debug.float-left(v-if="!IS_PRODUCTION && isUserLoaded")
          button.btn.btn-primary(@click="debugMenuShown = !debugMenuShown") Toggle Debug Menu
          .debug-group(v-if="debugMenuShown")
            a.btn.btn-default(@click="setHealthLow()") Health = 1
            a.btn.btn-default(@click="addMissedDay(1)") +1 Missed Day
            a.btn.btn-default(@click="addMissedDay(2)") +2 Missed Days
            a.btn.btn-default(@click="addMissedDay(8)") +8 Missed Days
            a.btn.btn-default(@click="addMissedDay(32)") +32 Missed Days
            a.btn.btn-default(@click="addTenGems()") +10 Gems
            a.btn.btn-default(@click="addHourglass()") +1 Mystic Hourglass
            a.btn.btn-default(@click="addGold()") +500GP
            a.btn.btn-default(@click="plusTenHealth()") + 10HP
            a.btn.btn-default(@click="addMana()") +MP
            a.btn.btn-default(@click="addLevelsAndGold()") +Exp +GP +MP
            a.btn.btn-default(@click="addOneLevel()") +1 Level
            a.btn.btn-default(@click="addQuestProgress()", tooltip="+1000 to boss quests. 300 items to collection quests") Quest Progress Up
            a.btn.btn-default(@click="makeAdmin()") Make Admin
            a.btn.btn-default(@click="openModifyInventoryModal()") Modify Inventory
      .col-12.col-md-2.text-center
        .logo.svg-icon(v-html='icons.gryphon')
      .col-12.col-md-5.text-right
        template(v-if="!isExpandedFooter")
          span
            a(:href="getDataDisplayToolUrl", target='_blank') {{ $t('dataDisplayTool') }}
          span.ml-4
            a(target="_blanck", href="/static/community-guidelines") {{ $t('communityGuidelines') }}
        span.ml-4
          a(target="_blanck", href="/static/privacy") {{ $t('privacy') }}
        span.ml-4
          a(target="_blanck", href="/static/terms") {{ $t('terms') }}
</template>

<style lang="scss" scoped>
  footer {
    color: #c3c0c7;
    z-index: 17;
    padding-bottom: 3em;

    a {
      color: #2995cd;
    }

    &:not(.expanded) {
      hr {
        margin-top: 0px;
        margin-bottom: 7px;
      }
    }

    &.expanded {
      padding-left: 6em;
      padding-right: 6em;
      padding-top: 3em;
      background: #e1e0e3;
      color: #878190;
      min-height: 408px;

      a {
        color: #878190;
      }

      .logo {
        color: #c3c0c7;
      }
    }

    & > .row {
      margin-left: 12px;
      margin-right: 12px;
    }
  }

  h3 {
    color: #878190;
  }

  ul {
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-bottom: .5em;
  }

  .social {
    h3 {
      text-align: right;
    }
  }

  .social-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #c3c0c7;
    display: inline-block;
    margin-left: 1em;
    float: right;

    .social-icon {
      color: #e1e0e3;
      width: 16px;
      margin: 0 auto;
      margin-top: 1em;
    }

    .facebook {
      margin-top: .7em;
    }

    .instagram {
      margin-top: .85em;
    }
  }

  .logo {
    width: 24px;
    height: 24px;
    margin: 0 auto;
    color: #e1e0e3;
  }

  .debug-group {
    position: absolute;
    background: #fff;
    top: -300px;
    border-radius: 2px;
    padding: 2em;
  }

  .btn-contribute {
    background: #c3c0c7;
    box-shadow: none;
    border-radius: 4px;

    .heart {
      width: 18px;
      margin-right: .5em;
      margin-bottom: .2em;
    }

    .text, .heart {
      display: inline-block;
      vertical-align: bottom;
    }
  }
</style>

<style>
  .facebook svg {
    width: 10px;
    margin: 0 auto;
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';

import gryphon from 'assets/svg/gryphon.svg';
import twitter from 'assets/svg/twitter.svg';
import facebook from 'assets/svg/facebook.svg';
import instagram from 'assets/svg/instagram.svg';
import heart from 'assets/svg/heart.svg';

import modifyInventory from './modifyInventory';
import buyGemsModal from './payments/buyGemsModal';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env

export default {
  components: {
    modifyInventory,
    buyGemsModal,
  },
  data () {
    return {
      icons: Object.freeze({
        gryphon,
        twitter,
        facebook,
        instagram,
        heart,
      }),
      debugMenuShown: false,
      IS_PRODUCTION,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    ...mapState(['isUserLoaded']),
    isExpandedFooter () {
      return this.$route.name === 'tasks' ? false : true;
    },
    getDataDisplayToolUrl () {
      const base = 'https://oldgods.net/habitrpg/habitrpg_user_data_display.html';
      if (!this.user) return;

      return `${base}?uuid=${this.user._id}`;
    },
  },
  methods: {
    plusTenHealth () {
      this.$store.dispatch('user:set', {
        'stats.hp': this.user.stats.hp += 10,
      });
    },
    setHealthLow () {
      this.$store.dispatch('user:set', {
        'stats.hp': 1,
      });
    },
    async addMissedDay (numberOfDays) {
      if (!confirm(`Are you sure you want to reset the day by ${numberOfDays} day(s)?`)) return;

      let date = moment(this.user.lastCron).subtract(numberOfDays, 'days').toDate();

      await axios.post('/api/v3/debug/set-cron', {
        lastCron: date,
      });

      // @TODO: Notification.text('-' + numberOfDays + ' day(s), remember to refresh');
      // @TODO: Sync user?
    },
    async addTenGems () {
      await axios.post('/api/v3/debug/add-ten-gems');
      // @TODO: Notification.text('+10 Gems!');
      this.user.balance += 2.5;
    },
    async addHourglass () {
      await axios.post('/api/v3/debug/add-hourglass');
      // @TODO: Sync?
    },
    addGold () {
      this.$store.dispatch('user:set', {
        'stats.gp': this.user.stats.gp + 500,
      });
    },
    addMana () {
      this.$store.dispatch('user:set', {
        'stats.mp': this.user.stats.mp + 500,
      });
    },
    addLevelsAndGold () {
      this.$store.dispatch('user:set', {
        'stats.exp': this.user.stats.exp + 10000,
        'stats.gp': this.user.stats.gp  + 10000,
        'stats.mp': this.user.stats.mp  + 10000,
      });
    },
    addOneLevel () {
      // @TODO: Name these variables better
      let exp = 0;
      let five = 10 * this.user.stats.lvl;
      let four = Math.pow(this.user.stats.lvl, 2) * 0.25;
      let three = four + five + 139.75;
      let two = three / 10;
      let one = Math.round(two) * 10;
      exp = this.user.stats.exp + one;

      this.$store.dispatch('user:set', {
        'stats.exp': exp,
      });
    },
    async addQuestProgress () {
      await axios.post('/api/v3/debug/quest-progress');

      //  @TODO:  Notification.text('Quest progress increased');
      //  @TODO:  User.sync();
    },
    async makeAdmin  () {
      await axios.post('/api/v3/debug/make-admin');

      // @TODO: Notification.text('You are now an admin! Go to the Hall of Heroes to change your contributor level.');
      // @TODO: sync()
    },
    openModifyInventoryModal  () {
      this.$root.$emit('bv::show::modal', 'modify-inventory');
    },
    donate () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > Donate',
      });
      this.$root.$emit('bv::show::modal', 'buy-gems', {alreadyTracked: true});
    },
  },
};
</script>
