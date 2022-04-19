<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Contributor Details
    </h3>
    <div v-if="expand">
      <form @submit.prevent="saveHero({hero, msg: 'Contributor details', clearData: true})">
        <div>
          <label>Permissions</label>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.fullAccess"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              Full Admin Access (Allows access to everything. EVERYTHING)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.userSupport"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              User Support (Access this form, access purchase history)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.news"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              News poster (Bailey CMS)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.moderator"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              Community Moderator (ban and mute users, access chat flags, manage social spaces)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.challengeAdmin"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              Challenge Admin (can create official habitica challenges and admin all challenges)
            </label>
          </div>
          <div class="checkbox">
            <label>
              <input
                v-model="hero.permissions.coupons"
                :disabled="!hasPermission(user, 'fullAccess')"
                type="checkbox"
              >
              Coupon Creator (can manage coupon codes)
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input
            v-model="hero.contributor.text"
            class="form-control textField"
            type="text"
          >
          <small>
            Common titles:
            <strong>Ambassador, Artisan, Bard, Blacksmith, Challenger, Comrade, Fletcher,
              Linguist, Linguistic Scribe, Scribe, Socialite, Storyteller</strong>.
            <br>
            Rare titles:
            Advisor, Chamberlain, Designer, Mathematician, Shirtster, Spokesperson,
            Statistician, Tinker, Transcriber, Troubadour.
          </small>
        </div>
        <div class="form-group form-inline">
          <label>Tier</label>
          <input
            v-model="hero.contributor.level"
            class="form-control levelField"
            type="number"
          >
          <small>
            1-7 for normal contributors, 8 for moderators, 9 for staff.
            This determines which items, pets, mounts are available, and name-tag coloring.
            Tiers 8 and 9 are automatically given admin status.
          </small>
        </div>
        <div
          v-if="hero.secret.text"
          class="form-group"
        >
          <label>Moderation Notes</label>
          <div
            v-markdown="hero.secret.text"
            class="markdownPreview"
          ></div>
        </div>
        <div class="form-group">
          <label>Contributions</label>
          <textarea
            v-model="hero.contributor.contributions"
            class="form-control"
            cols="5"
            rows="5"
          ></textarea>
          <div
            v-markdown="hero.contributor.contributions"
            class="markdownPreview"
          ></div>
        </div>
        <div class="form-group">
          <label>Edit Moderation Notes</label>
          <textarea
            v-model="hero.secret.text"
            class="form-control"
            cols="5"
            rows="3"
          ></textarea>
          <div
            v-markdown="hero.secret.text"
            class="markdownPreview"
          ></div>
        </div>
        <input
          type="submit"
          value="Save and Clear Data"
          class="btn btn-primary"
        >
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .levelField {
    min-width: 10ch;
  }
  .textField {
    min-width: 50ch;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

import { mapState } from '@/libs/store';
import { userStateMixin } from '../../../mixins/userState';

function resetData (self) {
  self.expand = self.hero.contributor.level;
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [
    userStateMixin,
    saveHero,
  ],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
};
</script>
