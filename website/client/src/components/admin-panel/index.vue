<template>
  <div v-if="user.contributor.admin" class="row standard-page">
    <div class="well">
      <h1>Admin Panel</h1>
      <div class="row">
        <div class="form-inline col-12">
          <div class="form-group">
            <input
              v-model="heroID"
              class="form-control"
              type="text"
              :placeholder="'User ID or Username'"
              :style="{ 'min-width': '45ch' }"
              @keyup.enter="loadHero(heroID)"
            >
          </div>
          <div class="form-group">
            <button
              class="btn btn-secondary"
              @click="loadHero(heroID)"
            >
              Load User (click or hit enter)
            </button>
          </div>
        </div>
      </div>

      <div v-if="hero && hero.profile" class="row">
        <div class="form col-6">
          <h2>@{{ hero.auth.local.username }} &nbsp; / &nbsp; {{ hero.profile.name }}</h2>
          <div class="form-group">
            {{ hero._id }} &nbsp;
            <router-link :to="{'name': 'userProfile', 'params': {'userId': hero._id}}">
              profile link
            </router-link>
          </div>

          <div class="accordion-group">
            <h3
              class="expand-toggle"
              :class="{'open': expandPriv}"
              @click="expandPriv = !expandPriv"
            >
              Privileges, Gem Balance
            </h3>
            <div v-if="expandPriv">
              <div class="form-group">
                <div class="checkbox">
                  <label>
                    <input
                      v-if="hero.flags"
                      v-model="hero.flags.chatShadowMuted"
                      type="checkbox"
                    > Shadow Mute
                  </label>
                </div>
                <div class="checkbox">
                  <label>
                    <input
                      v-if="hero.flags"
                      v-model="hero.flags.chatRevoked"
                      type="checkbox"
                    > Mute (Revoke Chat Privileges)
                  </label>
                </div>
                <div class="checkbox">
                  <label>
                    <input
                      v-model="hero.auth.blocked"
                      type="checkbox"
                    > Ban / Block
                  </label>
                </div>
                <div class="form-inline">
                  <label>Balance</label>
                  <input
                    v-model="hero.balance"
                    class="form-control"
                    type="number"
                    step="0.25"
                    :style="{ 'width': '15ch' }"
                  >
                  <span>
                    <small>
                      Balance is in USD, not in Gems.
                      E.g., if this number is 1, it means 4 Gems.
                      Arrows change Balance by 0.25 (i.e., 1 Gem per click).
                      Do not use when awarding tiers; tier gems are automatic.
                    </small>
                  </span>
                </div>
                <button class="form-control btn btn-primary" @click="saveHero()">Save</button>
              </div>
            </div> <!-- TST end of v-if="expandPriv" -->
          </div>

          <div class="accordion-group">
            <h3
              class="expand-toggle"
              :class="{'open': expandAuth}"
              @click="expandAuth = !expandAuth"
            >
              Authentication, Email, Timestamps
            </h3>
            <div v-if="expandAuth">
              <pre>{{ hero.auth }}</pre>
            </div>
          </div>

          <div class="accordion">
            <div
              class="accordion-group"
              heading="Items"
            >
              <h3
                class="expand-toggle"
                :class="{'open': expandItems}"
                @click="expandItems = !expandItems"
              >
                Update Item
              </h3>
              <div
                v-if="expandItems"
                class="form-group well"
              >
                <input
                  v-model="hero.itemPath"
                  class="form-control"
                  type="text"
                  placeholder="Path (eg, items.pets.BearCub-Base)"
                >
                <small class="muted">
                  Enter the
                  <strong>item path</strong>. E.g.,
                  <code>items.pets.BearCub-Zombie</code> or
                  <code>items.gear.owned.head_special_0</code> or
                  <code>items.gear.equipped.head</code>. You can find all the item paths below.
                </small>
                <br>
                <input
                  v-model="hero.itemVal"
                  class="form-control"
                  type="text"
                  placeholder="Value (eg, 5)"
                >
                <small class="muted">
                  Enter the
                  <strong>item value</strong>. E.g.,
                  <code>5</code> or
                  <code>false</code> or
                  <code>head_warrior_3</code>. All values are listed in the All Item Paths section below. <!-- eslint-disable-line max-len -->
                </small>
                <div class="accordion">
                  <div
                    class="accordion-group"
                    heading="All Item Paths"
                  >
                    <pre>{{ allItemPaths }}</pre>
                  </div>
                  <div
                    class="accordion-group"
                    heading="Current Items"
                  >
                    <pre>{{ hero.items }}</pre>
                  </div>
                </div>
                <div class="form-group">
                  <button class="form-control btn btn-primary" @click="saveHero()">Save</button>
                </div>
              </div>
            </div>
          </div>

          <div class="accordion-group">
            <h3
              class="expand-toggle"
              :class="{'open': expandContrib}"
              @click="expandContrib = !expandContrib"
            >
              Contributor Details
            </h3>
            <div v-if="expandContrib">
              <div class="form-group form-inline">
                <label>Title</label>
                <input
                  v-model="hero.contributor.text"
                  class="form-control"
                  type="text"
                  :style="{ 'min-width': '50ch' }"
                >
                <small>
                  Common titles:
                  <strong>Ambassador, Artisan, Bard, Blacksmith, Challenger, Comrade, Fletcher,
                  Linguist, Linguistic Scribe, Scribe, Socialite, Storyteller</strong>.
                </small>
                <small>
                  Rare titles:
                  Advisor, Chamberlain, Designer, Mathematician, Shirtster, Spokesperson,
                  Statistician, Tinker, Transcriber, Troubadour.
                </small>
              </div>
              <div class="form-group form-inline">
                <label>Tier</label>
                <input
                  v-model="hero.contributor.level"
                  class="form-control"
                  type="number"
                  :style="{ 'width': '10ch' }"
                >
                <small>
                  1-7 for normal contributors, 8 for moderators, 9 for staff.
                  This determines which items, pets, mounts are available, and name-tag coloring.
                  Tiers 8 and 9 are automatically given admin status.
                  <a
                    target="_blank"
                    href="https://trello.com/c/wkFzONhE/277-contributor-gear"
                  >More details (1-7)</a>,&nbsp;
                  <a
                    target="_blank"
                    href="https://github.com/HabitRPG/habitica/issues/3801"
                  >more details (8-9)</a>
                </small>
              </div>
              <div class="form-group">
                <label>Contributions</label>
                <textarea
                  v-model="hero.contributor.contributions"
                  class="form-control"
                  cols="5"
                  rows="5"
                ></textarea>
              </div>
              <div class="form-group">
                <button class="form-control btn btn-primary" @click="saveHero()">Save</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  h3 {
    margin-top: 2em;
  }
  h3.expand-toggle::after {
    margin-left: 5px;
  }
  .form-inline {
    margin-bottom: 1em;
    input {
      margin-left: 10px;
    }
  }
</style>

<script>
import each from 'lodash/each';

import markdownDirective from '@/directives/markdown';
import styleHelper from '@/mixins/styleHelper';
import { mapState } from '@/libs/store';
import * as quests from '@/../../common/script/content/quests';
import { mountInfo, petInfo } from '@/../../common/script/content/stable';
import content from '@/../../common/script/content';
import gear from '@/../../common/script/content/gear';
import notifications from '@/mixins/notifications';

export default {
  components: {
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [notifications, styleHelper],
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
      food: content.food,
      hatchingPotions: content.hatchingPotions,
      special: content.special,
      gear,
      expandPriv: false,
      expandAuth: false,
      expandItems: false,
      expandContrib: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.heroes = await this.$store.dispatch('hall:getHeroes');
  },
  methods: {
    getAllItemPaths () {
      // let questsFormat = this.getFormattedItemReference
      // ('items.quests', keys(this.quests), 'Numeric Quantity');
      // let mountsFormat = this.getFormattedItemReference
      // ('items.mounts', keys(this.mountInfo), 'Boolean');
      // let foodFormat = this.getFormattedItemReference
      // ('items.food', keys(this.food), 'Numeric Quantity');
      // let eggsFormat = this.getFormattedItemReference
      // ('items.eggs', keys(this.eggs), 'Numeric Quantity');
      // let hatchingPotionsFormat = this.getFormattedItemReference
      // ('items.hatchingPotions', keys(this.hatchingPotions), 'Numeric Quantity');
      // let petsFormat = this.getFormattedItemReference
      // ('items.pets', keys(this.petInfo), '-1:
      // Owns Mount, 0: Not Owned, 1-49: Progress to mount');
      // let specialFormat = this.getFormattedItemReference
      // ('items.special', keys(this.special), 'Numeric Quantity');
      // let gearFormat = this.getFormattedItemReference
      // ('items.gear.owned', keys(this.gear.flat), 'Boolean');
      //
      // let equippedGearFormat = ''; // @TODO:
      // '\nEquipped Gear:\n\titems.gear.{equipped/costume}
      // .{head/headAccessory/eyewear/armor/body/back/shield/weapon}.{gearKey}\n';
      // let equippedPetFormat = ''; // @TODO:'\nEquipped Pet:\n\titems.currentPet.{petKey}\n';
      // let equippedMountFormat = ''; // @TODO:
      // '\nEquipped Mount:\n\titems.currentMount.{mountKey}\n';
      //
      // let data = questsFormat.concat(mountsFormat,
      // foodFormat, eggsFormat, hatchingPotionsFormat,
      // petsFormat, specialFormat, gearFormat, equippedGearFormat,
      // equippedPetFormat, equippedMountFormat);
      //
      // return data;
    },
    getFormattedItemReference (pathPrefix, itemKeys, values) {
      let finishedString = '\n'.concat('path: ', pathPrefix, ', ', 'value: {', values, '}\n');

      each(itemKeys, key => {
        finishedString = finishedString.concat('\t', pathPrefix, '.', key, '\n');
      });

      return finishedString;
    },
    async loadHero (uuid, heroIndex) {
      this.currentHeroIndex = heroIndex;
      const hero = await this.$store.dispatch('hall:getHero', { uuid });
      this.hero = { ...hero };
      if (!this.hero.flags) {
        this.hero.flags = {
          chatRevoked: false,
          chatShadowMuted: false,
        };
      }
      this.expandPriv = true;
      this.expandAuth = false;
      this.expandItems = false;
      this.expandContrib = true;
    },
    async saveHero () {
      this.hero.contributor.admin = this.hero.contributor.level > 7;
      const heroUpdated = await this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
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
  },
};
</script>
