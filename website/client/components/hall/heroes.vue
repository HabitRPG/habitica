<template lang="pug">
.row
  small.muted(v-html="$t('blurbHallContributors')")
  .well(v-if='user.contributor.admin')
      h2 {{ $t('rewardUser') }}
      form(submit='loadHero(heroID)') // @TODO: make click
        .form-group
          input.form-control(type='text', v-model='heroID', placeholder="$t('UUID')")
        .form-group
          input.btn.btn-default(type='submit')
          | {{ $t('loadUser') }}
      form(v-if='hero && hero.profile', submit='saveHero(hero)') // @TODO: make click
        a(v-click='clickMember(hero._id, true)')
          h3 {{hero.profile.name}}
        .form-group
          input.form-control(type='text', v-model='hero.contributor.text', placeholder {{ $t('contribTitle') }})
        .form-group
          label {{ $t('contribLevel') }}
          input.form-control(type='number', v-model='hero.contributor.level')
          small {{ $t('contribHallText') }}
          |&nbsp;
          a(target='_blank', href='https://trello.com/c/wkFzONhE/277-contributor-gear') {{ $t('moreDetails') }}
          |,&nbsp;
          a(target='_blank', href='https://github.com/HabitRPG/habitica/issues/3801') {{ $t('moreDetails2') }}
        .form-group
          textarea.form-control(cols=5, placeholder {{ $t('contributions') }}, v-model='hero.contributor.contributions')
          //include ../../shared/formattiv-help
        hr

        .form-group
          label {{ $t('balance') }}
          input.form-control(type='number', step="any", v-model='hero.balance')
          small {{ '`user.balance`' + this.$t('notGems') }}
        accordion
          accordion-group(heading='Items')
            h4 Update Item
            .form-group.well
              input.form-control(type='text',placeholder='Path (eg, items.pets.BearCub-Base)',v-model='hero.itemPath')
              small.muted Enter the <strong>item path</strong>. E.g., <code>items.pets.BearCub-Zombie</code> or <code>items.gear.owned.head_special_0</code> or <code>items.gear.equipped.head</code>. You can find all the item paths below.
              br
              input.form-control(type='text',placeholder='Value (eg, 5)',v-model='hero.itemVal')
              small.muted Enter the <strong>item value</strong>. E.g., <code>5</code> or <code>false</code> or <code>head_warrior_3</code>. All values are listed in the All Item Paths section below.
              accordion
                accordion-group(heading='All Item Paths')
                  pre {{allItemPaths}}
                accordion-group(heading='Current Items')
                  pre {{toJson(hero.items, true)}}
          accordion-group(heading='Auth')
            h4 Auth
            pre {{toJson(hero.auth)}}
            .form-group
              .checkbox
                label
                  input(type='checkbox', v-model='hero.flags.chatRevoked')
                  | Chat Privileges Revoked
            .form-group
              .checkbox
                label
                  input(type='checkbox', v-model='hero.auth.blocked')
                  | Blocked

        // h4 Backer Status
        // Add backer stuff like tier, disable adds, etcs
        .form-group
          input.form-control.btn.btn-primary(type='submit')
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
            tr(v-for='(hero, $index) in heroes')
              td
                span(v-if='hero.contributor && hero.contributor.admin', :popover="$t('gamemaster')", popover-trigger='mouseenter', popover-placement='right')
                  a.label.label-default(v-class='userLevelStyle(hero)', v-click='clickMember(hero._id, true)')
                    | {{hero.profile.name}}&nbsp;
                    span(v-class='userAdminGlyphiconStyle(hero)')
                span(v-if='!hero.contributor || !hero.contributor.admin')
                  a.label.label-default(v-if='hero.profile', v-class='userLevelStyle(hero)', v-click='clickMember(hero._id, true)') {{hero.profile.name}}
              td(v-if='user.contributor.admin', v-click='populateContributorInput(hero._id, $index)').btn-link {{hero._id}}
              td {{hero.contributor.level}}
              td {{hero.contributor.text}}
              td
                markdown(text='hero.contributor.contributions', target='_blank')
</template>

<script>
// import keys from 'lodash/keys';
import each from 'lodash/each';

import { mapState } from 'client/libs/store';
import quests from 'common/script/content/quests';
import { mountInfo, petInfo } from 'common/script/content/stable';
import { food, hatchingPotions, special } from 'common/script/content';
import gear from 'common/script/content/gear';

export default {
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
    };
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
      if (!heroIndex) return;
      let hero = await this.$store.dispatch('hall:getHero', { uuid });
      this.hero = hero;
    },
    async saveHero (hero) {
      this.hero.contributor.admin = this.hero.contributor.level > 7 ? true : false;
      let heroUpdated = await this.$store.dispatch('hall:updateHero', { heroDetails: hero });
      // @TODO: Import
      // Notification.text("User updated");
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
    clickMember () {
      // @TODO: implement
    },
    userLevelStyle () {
      // @TODO: implement
    },
  },
};
</script>
