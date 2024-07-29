<template>
  <form @submit.prevent="saveHero({ hero, msg: 'Contributor details', clearData: true })">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{ 'open': expand }"
          @click="expand = !expand"
        >
          Contributor Details
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
        <div class="mb-4">
          <h3 class="mt-0">
            Permissions
          </h3>
          <div
            v-for="permission in permissionList"
            :key="permission.key"
            class="col-sm-9 offset-sm-3"
          >
            <div class="custom-control custom-checkbox">
              <input
                v-model="hero.permissions[permission.key]"
                :disabled="!hasPermission(user, permission.key)"
                class="custom-control-input"
                type="checkbox"
              >
              <label class="custom-control-label">
                {{ permission.name }}<br>
                <small class="text-secondary">{{ permission.description }}</small>
              </label>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Title</label>
          <div class="col-sm-9">
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
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Tier</label>
          <div class="col-sm-9">
            <input
              v-model="hero.contributor.level"
              class="form-control levelField"
              type="number"
            >
            <small>
              1-7 for normal contributors, 8 for moderators, 9 for staff.
              This determines which items, pets, mounts are available, and name-tag coloring.
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Contributions</label>
          <div class="col-sm-9">
            <textarea
              v-model="hero.contributor.contributions"
              class="form-control"
              cols="5"
              rows="5"
            >
              </textarea>
            <div
              v-markdown="hero.contributor.contributions"
              class="markdownPreview"
            ></div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Moderation Notes</label>
          <div class="col-sm-9">
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
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </div>
    </div>
  </form>
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

const permissionList = [
  {
    key: 'fullAccess',
    name: 'Full Admin Access',
    description: 'Allows access to everything. EVERYTHING',
  },
  {
    key: 'userSupport',
    name: 'User Support',
    description: 'Access this form, access purchase history',
  },
  {
    key: 'news',
    name: 'News Poster',
    description: 'Bailey CMS',
  },
  {
    key: 'moderator',
    name: 'Community Moderator',
    description: 'Ban and mute users, access chat flags, manage social spaces',
  },
  {
    key: 'challengeAdmin',
    name: 'Challenge Admin',
    description: 'Can create official habitica challenges and admin all challenges',
  },
  {
    key: 'coupons',
    name: 'Coupon Creator',
    description: 'Can manage coupon codes',
  },
];

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
      permissionList,
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
