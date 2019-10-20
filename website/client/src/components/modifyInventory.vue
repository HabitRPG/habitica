<!-- eslint-disable -->
<!-- TODO re-enable when used again -->
<template>
  <b-modal
    v-if="user.profile"
    id="modify-inventory"
    title="Modify Inventory"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-header">
      <h4>Modify Inventory for {{ user.profile.name }}</h4>
    </div>
    <div class="modal-body">
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.gear"
              @click="showInv.gear = true"
            >
              Show Gear
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.gear"
              @click="showInv.gear = false"
            >
              Hide Gear
            </button>
            <h4>Gear</h4>
            <div ng-if="showInv.gear">
              <button
                class="btn btn-secondary"
                @click="setAllItems('gear', true)"
              >
                Own All
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('gear', false)"
              >
                Previously Own All
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('gear', undefined)"
              >
                Never Own All
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.gear.flat"
                  class="list-group-item"
                  ng-init="inv.gear[item.key] = user.items.gear.owned[item.key]"
                >
                  <div
                    class="pull-left"
                    :class="'shop_' + item.key"
                    style="margin-right: 10px"
                  ></div>
                  {{ item.text() }}
                  <div class="clearfix">
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'gear-' + item.key"
                        ng-model="inv.gear[item.key]"
                        ng-value="true"
                      >Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'gear-' + item.key"
                        ng-model="inv.gear[item.key]"
                        ng-value="false"
                      >Previously Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'gear-' + item.key"
                        ng-model="inv.gear[item.key]"
                        ng-value="undefined"
                      >Never Owned
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.special"
              @click="showInv.special = true"
            >
              Show Special Items
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.special"
              @click="showInv.special = false"
            >
              Hide Special Items
            </button>
            <h4>Special Items</h4>
            <div ng-if="showInv.special">
              <button
                class="btn btn-secondary"
                @click="setAllItems('special', 999)"
              >
                Set All to 999
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('special', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('special', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.special"
                  class="list-group-item"
                  ng-init="inv.special[item.key] = user.items.special[item.key]"
                  ng-if="item.value === 15"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'inventory_special_' + item.key"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ item.text() }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.special[item.key]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.pets"
              @click="showInv.pets = true"
            >
              Show Pets
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.pets"
              @click="showInv.pets = false"
            >
              Hide Pets
            </button>
            <h4>Pets</h4>
            <div ng-if="showInv.pets">
              <button
                class="btn btn-secondary"
                @click="setAllItems('pets', 45)"
              >
                Set All to 45
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('pets', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('pets', -1)"
              >
                Set All to -1
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('pets', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <h5>Drop Pets</h5>
              <ul class="list-group">
                <li
                  v-for="(pet, value) in content.pets"
                  class="list-group-item"
                  ng-init="inv.pets[pet] = user.items.pets[pet]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet-' + pet"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ pet }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.pets[pet]"
                    >
                  </div>
                </li>
              </ul>
              <h5>Quest Pets</h5>
              <ul class="list-group">
                <li
                  v-for="(pet, value) in content.questPets"
                  class="list-group-item"
                  ng-init="inv.pets[pet] = user.items.pets[pet]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet-' + pet"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ pet }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.pets[pet]"
                    >
                  </div>
                </li>
              </ul>
              <h5>Special Pets</h5>
              <ul class="list-group">
                <li
                  v-for="(pet, value) in content.specialPets"
                  class="list-group-item"
                  ng-init="inv.pets[pet] = user.items.pets[pet]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet-' + pet"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ pet }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.pets[pet]"
                    >
                  </div>
                </li>
              </ul>
              <h5>Premium Pets</h5>
              <ul class="list-group">
                <li
                  v-for="(pet, value) in content.premiumPets"
                  class="list-group-item"
                  ng-init="inv.pets[pet] = user.items.pets[pet]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet-' + pet"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ pet }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.pets[pet]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.mounts"
              @click="showInv.mounts = true"
            >
              Show Mounts
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.mounts"
              @click="showInv.mounts = false"
            >
              Hide Mounts
            </button>
            <h4>Mounts</h4>
            <div ng-if="showInv.mounts">
              <button
                class="btn btn-secondary"
                @click="setAllItems('mounts', true)"
              >
                Set all to Owned
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('mounts', undefined)"
              >
                Set all to Not Owned
              </button>
              <hr>
              <h5>Drop Mounts</h5>
              <ul class="list-group">
                <li
                  v-for="(mount, value) in content.mounts"
                  class="list-group-item"
                  ng-init="inv.mounts[mount] = user.items.mounts[mount]"
                >
                  <div
                    class="pull-left"
                    :class="'Mount_Icon_' + mount"
                    style="margin-right: 10px"
                  ></div>
                  {{ mount }}
                  <div class="clearfix">
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="true"
                      >Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="undefined"
                      >Not Owned
                    </label>
                  </div>
                </li>
              </ul>
              <h5>Quest Mounts</h5>
              <ul class="list-group">
                <li
                  v-for="(mount, value) in content.questMounts"
                  class="list-group-item"
                  ng-init="inv.mounts[mount] = user.items.mounts[mount]"
                >
                  <div
                    class="pull-left"
                    :class="'Mount_Icon_' + mount"
                    style="margin-right: 10px"
                  ></div>
                  {{ mount }}
                  <div class="clearfix">
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="true"
                      >Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="undefined"
                      >Not Owned
                    </label>
                  </div>
                </li>
              </ul>
              <h5>Special Mounts</h5>
              <ul class="list-group">
                <li
                  v-for="(mount, value) in content.specialMounts"
                  class="list-group-item"
                  ng-init="inv.mounts[mount] = user.items.mounts[mount]"
                >
                  <div
                    class="pull-left"
                    :class="'Mount_Icon_' + mount"
                    style="margin-right: 10px"
                  ></div>
                  {{ mount }}
                  <div class="clearfix">
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="true"
                      >Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="undefined"
                      >Not Owned
                    </label>
                  </div>
                </li>
              </ul>
              <h5>Premium Mounts</h5>
              <ul class="list-group">
                <li
                  v-for="(mount, value) in content.premiumMounts"
                  class="list-group-item"
                  ng-init="inv.mounts[mount] = user.items.mounts[mount]"
                >
                  <div
                    class="pull-left"
                    :class="'Mount_Icon_' + mount"
                    style="margin-right: 10px"
                  ></div>
                  {{ mount }}
                  <div class="clearfix">
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="true"
                      >Owned
                    </label>
                    <label class="radio-inline">
                      <input
                        type="radio"
                        :name="'mounts-' + mount"
                        ng-model="inv.mounts[mount]"
                        ng-value="undefined"
                      >Not Owned
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.hatchingPotions"
              @click="showInv.hatchingPotions = true"
            >
              Show Hatching Potions
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.hatchingPotions"
              @click="showInv.hatchingPotions = false"
            >
              Hide Hatching Potions
            </button>
            <h4>Hatching Potions</h4>
            <div ng-if="showInv.hatchingPotions">
              <button
                class="btn btn-secondary"
                @click="setAllItems('hatchingPotions', 999)"
              >
                Set All to 999
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('hatchingPotions', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('hatchingPotions', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.hatchingPotions"
                  class="list-group-item"
                  ng-init="inv.hatchingPotions[item.key] = user.items.hatchingPotions[item.key]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet_HatchingPotion_' + item.key"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ item.text() }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.hatchingPotions[item.key]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.eggs"
              @click="showInv.eggs = true"
            >
              Show Eggs
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.eggs"
              @click="showInv.eggs = false"
            >
              Hide Eggs
            </button>
            <h4>Eggs</h4>
            <div ng-if="showInv.eggs">
              <button
                class="btn btn-secondary"
                @click="setAllItems('eggs', 999)"
              >
                Set All to 999
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('eggs', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('eggs', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.eggs"
                  class="list-group-item"
                  ng-init="inv.eggs[item.key] = user.items.eggs[item.key]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet_Egg_' + item.key"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ item.text() }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.eggs[item.key]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.food"
              @click="showInv.food = true"
            >
              Show Food
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.food"
              @click="showInv.food = false"
            >
              Hide Food
            </button>
            <h4>Food</h4>
            <div ng-if="showInv.food">
              <button
                class="btn btn-secondary"
                @click="setAllItems('food', 999)"
              >
                Set All to 999
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('food', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('food', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.food"
                  class="list-group-item"
                  ng-init="inv.food[item.key] = user.items.food[item.key]"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'Pet_Food_' + item.key"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ item.text() }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.food[item.key]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-xs-12">
            <button
              class="btn btn-secondary pull-right"
              ng-if="!showInv.quests"
              @click="showInv.quests = true"
            >
              Show Quests
            </button>
            <button
              class="btn btn-secondary pull-right"
              ng-if="showInv.quests"
              @click="showInv.quests = false"
            >
              Hide Quests
            </button>
            <h4>Quests</h4>
            <div ng-if="showInv.quests">
              <button
                class="btn btn-secondary"
                @click="setAllItems('quests', 999)"
              >
                Set All to 999
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('quests', 0)"
              >
                Set All to 0
              </button>
              <button
                class="btn btn-secondary"
                @click="setAllItems('quests', undefined)"
              >
                Set All to undefined
              </button>
              <hr>
              <ul class="list-group">
                <li
                  v-for="item in content.quests"
                  class="list-group-item"
                  ng-init="inv.quests[item.key] = user.items.quests[item.key]"
                  ng-if="item.category !== 'world'"
                >
                  <div class="form-inline clearfix">
                    <div
                      class="pull-left"
                      :class="'inventory_quest_scroll_' + item.key"
                      style="margin-right: 10px"
                    ></div>
                    <p>{{ item.text() }}</p>
                    <input
                      class="form-control"
                      type="number"
                      ng-model="inv.quests[item.key]"
                    >
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        @click="close()"
      >
        {{ $t('close') }}
      </button>
      <button
        class="btn btn-primary"
        @click="close();modifyInventory()"
      >
        Apply Changes
      </button>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';

import { mapState } from '@/libs/store';

import Content from '@/../../common/script/content';

export default {
  data () {
    const showInv = {};
    const inv = {
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
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    setAllItems (type, value) {
      const set = this.inv[type];

      for (const item of Object.keys(set)) {
        set[item] = value;
      }
    },
    async modifyInventory  () {
      await axios.post('/api/v4/debug/modify-inventory', {
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
