<template>
  <div class="row standard-page">
    <small
      class="muted"
      v-html="$t('blurbHallContributors')"
    ></small>
    <div class="well">
      <div v-if="user.contributor.admin">
        <h2>Reward User</h2>
        <div class="row">
          <div
            v-if="!hero.profile"
            class="form col-6"
          >
            <div class="form-group">
              <input
                v-model="heroID"
                class="form-control"
                type="text"
                :placeholder="'User ID or Username'"
              >
            </div>
            <div class="form-group">
              <button
                class="btn btn-secondary"
                @click="loadHero(heroID)"
              >
                Load User
              </button>
            </div>
          </div>
        </div>
        <div class="row">
          <div
            v-if="hero && hero.profile"
            class="form col-6"
            submit="saveHero(hero)"
          >
            <router-link :to="{'name': 'userProfile', 'params': {'userId': hero._id}}">
              <h3>@{{ hero.auth.local.username }} &nbsp; / &nbsp; {{ hero.profile.name }}</h3>
            </router-link>
            <div class="form-group">
              <label>Contributor Title</label>
              <input
                v-model="hero.contributor.text"
                class="form-control"
                type="text"
              >
              <small>
                Common titles:
                <strong>Ambassador, Artisan, Bard, Blacksmith, Challenger, Comrade, Fletcher, Linguist, Linguistic Scribe, Scribe, Socialite, Storyteller</strong>. Rare titles: Advisor, Chamberlain, Designer, Mathematician, Shirtster, Spokesperson, Statistician, Tinker, Transcriber, Troubadour. <!-- eslint-disable-line max-len -->
              </small>
            </div>
            <div class="form-group">
              <label>Contributor Tier</label>
              <input
                v-model="hero.contributor.level"
                class="form-control"
                type="number"
              >
              <small>
                1-7 for normal contributors, 8 for moderators, 9 for staff. This determines which items, pets, and mounts are available, and name-tag coloring. Tiers 8 and 9 are automatically given admin status.&nbsp; <!-- eslint-disable-line max-len -->
                <a
                  href="https://habitica.fandom.com/wiki/Contributor_Rewards"
                  target="_blank"
                >More details</a>
              </small>
            </div>
            <div class="form-group">
              <label>Contributions</label>
              <textarea
                v-model="hero.contributor.contributions"
                class="form-control"
                cols="5"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Balance</label>
              <input
                v-model="hero.balance"
                class="form-control"
                type="number"
                step="any"
              >
              <small>
                <span>
                  '{{ hero.balance }}' is in USD,
                  <em>not</em> in Gems. E.g., if this number is 1, it means 4 Gems. Only use this option when manually granting Gems to players, don't use it when granting contributor tiers. Contrib tiers will automatically add Gems. <!-- eslint-disable-line max-len -->
                </span>
              </small>
            </div>
            <div class="accordion">
              <div
                class="accordion-group"
                heading="Items"
              >
                <h4
                  class="expand-toggle"
                  :class="{'open': expandItems}"
                  @click="expandItems = !expandItems"
                >
                  Update Item
                </h4>
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
                </div>
              </div>
              <div
                class="accordion-group"
                heading="Auth"
              >
                <h4
                  class="expand-toggle"
                  :class="{'open': expandAuth}"
                  @click="expandAuth = !expandAuth"
                >
                  Auth
                </h4>
                <div v-if="expandAuth">
                  <pre>{{ hero.auth }}</pre>
                  <div class="form-group">
                    <div class="checkbox">
                      <label>
                        <input
                          v-if="hero.flags"
                          v-model="hero.flags.chatShadowMuted"
                          type="checkbox"
                        >
                        <strong>Chat Shadow Muting On</strong>
                      </label>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="checkbox">
                      <label>
                        <input
                          v-if="hero.flags"
                          v-model="hero.flags.chatRevoked"
                          type="checkbox"
                        >
                        <strong>Chat Privileges Revoked</strong>
                      </label>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="checkbox">
                      <label>
                        <input
                          v-model="hero.auth.blocked"
                          type="checkbox"
                        >Blocked
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- h4 Backer Status-->
            <!-- Add backer stuff like tier, disable adds, etcs-->
            <div class="form-group">
              <button
                class="form-control btn btn-primary"
                @click="saveHero()"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>{{ $t('name') }}</th>
              <th v-if="user.contributor && user.contributor.admin">
                {{ $t('UUID') }}
              </th>
              <th>{{ $t('contribLevel') }}</th>
              <th>{{ $t('title') }}</th>
              <th>{{ $t('contributions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(hero, index) in heroes"
              :key="hero._id"
            >
              <td>
                <user-link
                  v-if="hero.contributor && hero.contributor.admin"
                  :user="hero"
                  :popover="$t('gamemaster')"
                  popover-trigger="mouseenter"
                  popover-placement="right"
                />
                <user-link
                  v-if="!hero.contributor || !hero.contributor.admin"
                  :user="hero"
                />
              </td>
              <td
                v-if="user.contributor.admin"
                class="btn-link"
                @click="populateContributorInput(hero._id, index)"
              >
                {{ hero._id }}
              </td>
              <td>{{ hero.contributor.level }}</td>
              <td>{{ hero.contributor.text }}</td>
              <td>
                <div
                  v-markdown="hero.contributor.contributions"
                  target="_blank"
                ></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  h4.expand-toggle::after {
    margin-left: 5px;
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
import userLink from '../userLink';

export default {
  components: {
    userLink,
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
      expandItems: false,
      expandAuth: false,
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
      this.expandItems = false;
      this.expandAuth = false;
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
