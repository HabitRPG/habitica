<template lang="pug">
.row.standard-page
  small.muted(v-html="$t('blurbHallContributors')")
  .well
    div(v-if='user.contributor.admin')
      h2 {{ $t('rewardUser') }}

      .row
        .form.col-6(v-if='!hero.profile')
          .form-group
            input.form-control(type='text', v-model='heroID', :placeholder="$t('UUID')")
          .form-group
            button.btn.btn-secondary(@click='loadHero(heroID)')
              | {{ $t('loadUser') }}

      .row
        .form.col-6(v-if='hero && hero.profile', submit='saveHero(hero)')
          a(@click='clickMember(hero, true)')
            h3 {{hero.profile.name}}
          .form-group
            input.form-control(type='text', v-model='hero.contributor.text', :placeholder="$t('contribTitle')")
          .form-group
            label {{ $t('contribLevel') }}
            input.form-control(type='number', v-model='hero.contributor.level')
            small {{ $t('contribHallText') }}
            |&nbsp;
            a(target='_blank', href='https://trello.com/c/wkFzONhE/277-contributor-gear') {{ $t('moreDetails') }}
            |,&nbsp;
            a(target='_blank', href='https://github.com/HabitRPG/habitica/issues/3801') {{ $t('moreDetails2') }}
          .form-group
            textarea.form-control(cols=5, :placeholder="$t('contributions')", v-model='hero.contributor.contributions')
            //include ../../shared/formattiv-help
          hr

          .form-group
            label {{ $t('balance') }}
            input.form-control(type='number', step="any", v-model='hero.balance')
            small {{ '`user.balance`' + this.$t('notGems') }}
          .accordion
            .accordion-group(heading='Items')
              h4.expand-toggle(:class="{'open': expandItems}", @click="expandItems = !expandItems") Update Item
              .form-group.well(v-if="expandItems")
                input.form-control(type='text',placeholder='Path (eg, items.pets.BearCub-Base)',v-model='hero.itemPath')
                small.muted Enter the <strong>item path</strong>. E.g., <code>items.pets.BearCub-Zombie</code> or <code>items.gear.owned.head_special_0</code> or <code>items.gear.equipped.head</code>. You can find all the item paths below.
                br
                input.form-control(type='text',placeholder='Value (eg, 5)',v-model='hero.itemVal')
                small.muted Enter the <strong>item value</strong>. E.g., <code>5</code> or <code>false</code> or <code>head_warrior_3</code>. All values are listed in the All Item Paths section below.
                .accordion
                  .accordion-group(heading='All Item Paths')
                    pre {{allItemPaths}}
                  .accordion-group(heading='Current Items')
                    pre {{hero.items}}
            .accordion-group(heading='Auth')
              h4.expand-toggle(:class="{'open': expandAuth}", @click="expandAuth = !expandAuth") Auth
              div(v-if="expandAuth")
                pre {{hero.auth}}
                .form-group
                  .checkbox
                    label
                      input(type='checkbox', v-if='hero.flags', v-model='hero.flags.chatRevoked')
                      | Chat Privileges Revoked
                .form-group
                  .checkbox
                    label
                      input(type='checkbox', v-model='hero.auth.blocked')
                      | Blocked

          // h4 Backer Status
          // Add backer stuff like tier, disable adds, etcs
          .form-group
            button.form-control.btn.btn-primary(@click='saveHero()')
              | {{ $t('save') }}

    .table-responsive
      table.table.table-striped
        thead
          tr
            th {{ $t('name') }}
            th(v-if='user.contributor && user.contributor.admin') {{ $t('UUID') }}
            th {{ $t('contribLevel') }}
            th {{ $t('title') }}
            th {{ $t('contributions') }}
        tbody
          tr(v-for='(hero, index) in heroes')
            td
              span(v-if='hero.contributor && hero.contributor.admin', :popover="$t('gamemaster')", popover-trigger='mouseenter', popover-placement='right')
                a.label.label-default(:class='userLevelStyle(hero)', @click='clickMember(hero, true)')
                  | {{hero.profile.name}}&nbsp;
                  //- span(v-class='userAdminGlyphiconStyle(hero)')
              span(v-if='!hero.contributor || !hero.contributor.admin')
                a.label.label-default(v-if='hero.profile', v-class='userLevelStyle(hero)', @click='clickMember(hero, true)') {{hero.profile.name}}
            td(v-if='user.contributor.admin', @click='populateContributorInput(hero._id, index)').btn-link {{hero._id}}
            td {{hero.contributor.level}}
            td {{hero.contributor.text}}
            td
              div(v-markdown='hero.contributor.contributions', target='_blank')
</template>

<style lang="scss" scoped>
  h4.expand-toggle::after {
    margin-left: 5px;
  }
</style>

<script>
// import keys from 'lodash/keys';
import each from 'lodash/each';

import markdownDirective from 'client/directives/markdown';
import { mapState } from 'client/libs/store';
import quests from 'common/script/content/quests';
import { mountInfo, petInfo } from 'common/script/content/stable';
import { food, hatchingPotions, special } from 'common/script/content';
import gear from 'common/script/content/gear';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  data () {
    return {
      heroes: [],
      hero: {},
      heroID: '',
      currentHeroIndex: -1,
      allItemPaths: this.getAllItemPaths(),
      quests,
      mountInfo,
      petInfo,
      food,
      hatchingPotions,
      special,
      gear,
      expandItems: false,
      expandAuth: false,
    };
  },
  directives: {
    markdown: markdownDirective,
  },
  async mounted () {
    this.heroes = await this.$store.dispatch('hall:getHeroes');
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    getAllItemPaths () {
      // let questsFormat = this.getFormattedItemReference('items.quests', keys(this.quests), 'Numeric Quantity');
      // let mountsFormat = this.getFormattedItemReference('items.mounts', keys(this.mountInfo), 'Boolean');
      // let foodFormat = this.getFormattedItemReference('items.food', keys(this.food), 'Numeric Quantity');
      // let eggsFormat = this.getFormattedItemReference('items.eggs', keys(this.eggs), 'Numeric Quantity');
      // let hatchingPotionsFormat = this.getFormattedItemReference('items.hatchingPotions', keys(this.hatchingPotions), 'Numeric Quantity');
      // let petsFormat = this.getFormattedItemReference('items.pets', keys(this.petInfo), '-1: Owns Mount, 0: Not Owned, 1-49: Progress to mount');
      // let specialFormat = this.getFormattedItemReference('items.special', keys(this.special), 'Numeric Quantity');
      // let gearFormat = this.getFormattedItemReference('items.gear.owned', keys(this.gear.flat), 'Boolean');
      //
      // let equippedGearFormat = ''; // @TODO: '\nEquipped Gear:\n\titems.gear.{equipped/costume}.{head/headAccessory/eyewear/armor/body/back/shield/weapon}.{gearKey}\n';
      // let equippedPetFormat = ''; // @TODO: '\nEquipped Pet:\n\titems.currentPet.{petKey}\n';
      // let equippedMountFormat = ''; // @TODO: '\nEquipped Mount:\n\titems.currentMount.{mountKey}\n';
      //
      // let data = questsFormat.concat(mountsFormat, foodFormat, eggsFormat, hatchingPotionsFormat, petsFormat, specialFormat, gearFormat, equippedGearFormat, equippedPetFormat, equippedMountFormat);
      //
      // return data;
    },
    getFormattedItemReference (pathPrefix, itemKeys, values) {
      let finishedString = '\n'.concat('path: ', pathPrefix, ', ', 'value: {', values, '}\n');

      each(itemKeys, (key) => {
        finishedString = finishedString.concat('\t', pathPrefix, '.', key, '\n');
      });

      return finishedString;
    },
    async loadHero (uuid, heroIndex) {
      this.currentHeroIndex = heroIndex;
      let hero = await this.$store.dispatch('hall:getHero', { uuid });
      this.hero = Object.assign({}, this.hero, hero);
      if (!this.hero.flags) {
        this.hero.flags = {
          chatRevoked: false,
        };
      }
      this.expandItems = false;
      this.expandAuth = false;
    },
    async saveHero () {
      this.hero.contributor.admin = this.hero.contributor.level > 7 ? true : false;
      let heroUpdated = await this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
      this.text('User updated');
      this.hero = {};
      this.heroID = -1;
      this.heroes[this.currentHeroIndex] = heroUpdated;
      this.currentHeroIndex = -1;
    },
    populateContributorInput (id, index) {
      this.heroID = id;
      window.scrollTo(0, 200);
      this.loadHero(id, index);
    },
    async clickMember (hero) {
      let heroDetails = await this.$store.dispatch('members:fetchMember', { memberId: hero._id });
      this.$root.$emit('habitica:show-profile', {
        user: heroDetails.data.data,
        startingPage: 'profile',
      });
    },
    userLevelStyle () {
      // @TODO: implement
    },
  },
};
</script>
