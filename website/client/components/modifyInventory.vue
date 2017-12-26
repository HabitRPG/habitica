<template lang="pug">
  b-modal#modify-inventory(v-if='user.profile', title="Modify Inventory", size='lg', :hide-footer="true")
    .modal-header
      h4 Modify Inventory for {{user.profile.name}}
    .modal-body
      .container-fluid
        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.gear", @click="showInv.gear = true") Show Gear
            button.btn.btn-secondary.pull-right(ng-if="showInv.gear", @click="showInv.gear = false") Hide Gear
            h4 Gear
            div(ng-if="showInv.gear")
              button.btn.btn-secondary(@click="setAllItems('gear', true)") Own All
              button.btn.btn-secondary(@click="setAllItems('gear', false)") Previously Own All
              button.btn.btn-secondary(@click="setAllItems('gear', undefined)") Never Own All

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.gear.flat" ng-init="inv.gear[item.key] = user.items.gear.owned[item.key]")
                  .pull-left(:class="'shop_' + item.key" style="margin-right: 10px")
                  | {{item.text()}}

                  .clearfix
                    label.radio-inline
                      input(type="radio", :name="'gear-' + item.key" ng-model="inv.gear[item.key]" ng-value="true")
                      | Owned
                    label.radio-inline
                      input(type="radio", :name="'gear-' + item.key" ng-model="inv.gear[item.key]" ng-value="false")
                      | Previously Owned
                    label.radio-inline
                      input(type="radio", :name="'gear-' + item.key" ng-model="inv.gear[item.key]" ng-value="undefined")
                      | Never Owned

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.special", @click="showInv.special = true") Show Special Items
            button.btn.btn-secondary.pull-right(ng-if="showInv.special", @click="showInv.special = false") Hide Special Items
            h4 Special Items
            div(ng-if="showInv.special")
              button.btn.btn-secondary(@click="setAllItems('special', 999)") Set All to 999
              button.btn.btn-secondary(@click="setAllItems('special', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('special', undefined)") Set All to undefined

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.special" ng-init="inv.special[item.key] = user.items.special[item.key]" ng-if="item.value === 15")
                  .form-inline.clearfix
                    .pull-left(:class="'inventory_special_' + item.key" style="margin-right: 10px")
                    p {{item.text()}}
                    input.form-control(type="number" ng-model="inv.special[item.key]")

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.pets", @click="showInv.pets = true") Show Pets
            button.btn.btn-secondary.pull-right(ng-if="showInv.pets", @click="showInv.pets = false") Hide Pets
            h4 Pets
            div(ng-if="showInv.pets")
              button.btn.btn-secondary(@click="setAllItems('pets', 45)") Set All to 45
              button.btn.btn-secondary(@click="setAllItems('pets', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('pets', -1)") Set All to -1
              button.btn.btn-secondary(@click="setAllItems('pets', undefined)") Set All to undefined

              hr

              h5 Drop Pets
              ul.list-group
                li.list-group-item(v-for="(pet, value) in content.pets" ng-init="inv.pets[pet] = user.items.pets[pet]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet-' + pet", style="margin-right: 10px")
                    p {{pet}}
                    input.form-control(type="number" ng-model="inv.pets[pet]")

              h5 Quest Pets
              ul.list-group
                li.list-group-item(v-for="(pet, value) in content.questPets" ng-init="inv.pets[pet] = user.items.pets[pet]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet-' + pet", style="margin-right: 10px")
                    p {{pet}}
                    input.form-control(type="number" ng-model="inv.pets[pet]")

              h5 Special Pets
              ul.list-group
                li.list-group-item(v-for="(pet, value) in content.specialPets" ng-init="inv.pets[pet] = user.items.pets[pet]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet-' + pet", style="margin-right: 10px")
                    p {{pet}}
                    input.form-control(type="number" ng-model="inv.pets[pet]")

              h5 Premium Pets
              ul.list-group
                li.list-group-item(v-for="(pet, value) in content.premiumPets" ng-init="inv.pets[pet] = user.items.pets[pet]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet-' + pet", style="margin-right: 10px")
                    p {{pet}}
                    input.form-control(type="number" ng-model="inv.pets[pet]")

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.mounts", @click="showInv.mounts = true") Show Mounts
            button.btn.btn-secondary.pull-right(ng-if="showInv.mounts", @click="showInv.mounts = false") Hide Mounts
            h4 Mounts
            div(ng-if="showInv.mounts")
              button.btn.btn-secondary(@click="setAllItems('mounts', true)") Set all to Owned
              button.btn.btn-secondary(@click="setAllItems('mounts', undefined)") Set all to Not Owned

              hr

              h5 Drop Mounts
              ul.list-group
                li.list-group-item(v-for="(mount, value) in content.mounts" ng-init="inv.mounts[mount] = user.items.mounts[mount]")
                  .pull-left(:class="'Mount_Icon_' + mount", style="margin-right: 10px")
                  | {{mount}}
                  .clearfix
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="true")
                      | Owned
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="undefined")
                      | Not Owned

              h5 Quest Mounts
              ul.list-group
                li.list-group-item(v-for="(mount, value) in content.questMounts" ng-init="inv.mounts[mount] = user.items.mounts[mount]")
                  .pull-left(:class="'Mount_Icon_' + mount", style="margin-right: 10px")
                  | {{mount}}
                  .clearfix
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="true")
                      | Owned
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="undefined")
                      | Not Owned

              h5 Special Mounts
              ul.list-group
                li.list-group-item(v-for="(mount, value) in content.specialMounts" ng-init="inv.mounts[mount] = user.items.mounts[mount]")
                  .pull-left(:class="'Mount_Icon_' + mount", style="margin-right: 10px")
                  | {{mount}}
                  .clearfix
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="true")
                      | Owned
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="undefined")
                      | Not Owned

              h5 Premium Mounts
              ul.list-group
                li.list-group-item(v-for="(mount, value) in content.premiumMounts" ng-init="inv.mounts[mount] = user.items.mounts[mount]")
                  .pull-left(:class="'Mount_Icon_' + mount", style="margin-right: 10px")
                  | {{mount}}
                  .clearfix
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="true")
                      | Owned
                    label.radio-inline
                      input(type="radio" , :name="'mounts-' + mount", ng-model="inv.mounts[mount]" ng-value="undefined")
                      | Not Owned

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.hatchingPotions", @click="showInv.hatchingPotions = true") Show Hatching Potions
            button.btn.btn-secondary.pull-right(ng-if="showInv.hatchingPotions", @click="showInv.hatchingPotions = false") Hide Hatching Potions
            h4 Hatching Potions
            div(ng-if="showInv.hatchingPotions")
              button.btn.btn-secondary(@click="setAllItems('hatchingPotions', 999)") Set All to 999
              button.btn.btn-secondary(@click="setAllItems('hatchingPotions', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('hatchingPotions', undefined)") Set All to undefined

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.hatchingPotions" ng-init="inv.hatchingPotions[item.key] = user.items.hatchingPotions[item.key]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet_HatchingPotion_' + item.key" style="margin-right: 10px")
                    p {{item.text()}}
                    input.form-control(type="number" ng-model="inv.hatchingPotions[item.key]")

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.eggs", @click="showInv.eggs = true") Show Eggs
            button.btn.btn-secondary.pull-right(ng-if="showInv.eggs", @click="showInv.eggs = false") Hide Eggs
            h4 Eggs
            div(ng-if="showInv.eggs")
              button.btn.btn-secondary(@click="setAllItems('eggs', 999)") Set All to 999
              button.btn.btn-secondary(@click="setAllItems('eggs', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('eggs', undefined)") Set All to undefined

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.eggs" ng-init="inv.eggs[item.key] = user.items.eggs[item.key]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet_Egg_' + item.key" style="margin-right: 10px")
                    p {{item.text()}}
                    input.form-control(type="number" ng-model="inv.eggs[item.key]")

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.food", @click="showInv.food = true") Show Food
            button.btn.btn-secondary.pull-right(ng-if="showInv.food", @click="showInv.food = false") Hide Food
            h4 Food
            div(ng-if="showInv.food")
              button.btn.btn-secondary(@click="setAllItems('food', 999)") Set All to 999
              button.btn.btn-secondary(@click="setAllItems('food', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('food', undefined)") Set All to undefined

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.food" ng-init="inv.food[item.key] = user.items.food[item.key]")
                  .form-inline.clearfix
                    .pull-left(:class="'Pet_Food_' + item.key" style="margin-right: 10px")
                    p {{item.text()}}
                    input.form-control(type="number" ng-model="inv.food[item.key]")

        hr

        .row
          .col-xs-12
            button.btn.btn-secondary.pull-right(ng-if="!showInv.quests", @click="showInv.quests = true") Show Quests
            button.btn.btn-secondary.pull-right(ng-if="showInv.quests", @click="showInv.quests = false") Hide Quests
            h4 Quests
            div(ng-if="showInv.quests")
              button.btn.btn-secondary(@click="setAllItems('quests', 999)") Set All to 999
              button.btn.btn-secondary(@click="setAllItems('quests', 0)") Set All to 0
              button.btn.btn-secondary(@click="setAllItems('quests', undefined)") Set All to undefined

              hr

              ul.list-group
                li.list-group-item(v-for="item in content.quests" ng-init="inv.quests[item.key] = user.items.quests[item.key]" ng-if="item.category !== 'world'")
                  .form-inline.clearfix
                    .pull-left(:class="'inventory_quest_scroll_' + item.key" style="margin-right: 10px")
                    p {{item.text()}}
                    input.form-control(type="number" ng-model="inv.quests[item.key]")
    .modal-footer
      button.btn.btn-secondary(@click="close()") {{ $t('close') }}
      button.btn.btn-primary(@click="close();modifyInventory()") Apply Changes
</template>

<script>
import axios from 'axios';

import { mapState } from 'client/libs/store';

import Content from '../../common/script/content';

export default {
  computed: {
    ...mapState({user: 'user.data'}),
  },
  data () {
    let showInv = {};
    let inv = {
      gear: {},
      special: {},
      pets: {},
      mounts: {},
      eggs: {},
      hatchingPotions: {},
      food: {},
      quests: {},
    };

    return {
      showInv,
      inv,
      content: Content,
    };
  },
  methods: {
    setAllItems (type, value) {
      let set = this.inv[type];

      for (let item in set) {
        if (set.hasOwnProperty(item)) {
          set[item] = value;
        }
      }
    },
    async modifyInventory  () {
      await axios.post('/api/v3/debug/modify-inventory', {
        gear: this.showInv.gear ? this.inv.gear : null,
        special: this.showInv.special ? this.inv.special : null,
        pets: this.showInv.pets ? this.inv.pets : null,
        mounts: this.showInv.mounts ? this.inv.mounts : null,
        eggs: this.showInv.eggs ? this.inv.eggs : null,
        hatchingPotions: this.showInv.hatchingPotions ? this.inv.hatchingPotions : null,
        food: this.showInv.food ? this.inv.food : null,
        quests: this.showInv.quests ? this.inv.quests : null,
      });

      // @TODO: Notification.text('Inventory updated. Refresh or sync.');
      // @TODO: Sync
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'modify-inventory');
    },
  },
};
</script>
