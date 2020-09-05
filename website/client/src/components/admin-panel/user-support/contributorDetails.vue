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
        <div class="checkbox">
          <label>
            <input
              v-model="hero.contributor.admin"
              type="checkbox"
            >
            Moderator abilities (see flags, clear flags, use this admin form)
          </label>
        </div>
        <div class="checkbox">
          <label>
            <input
              v-model="hero.contributor.newsPoster"
              type="checkbox"
            >
            News poster (Bailey CMS)
          </label>
        </div>
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
          <div
            v-markdown="hero.contributor.contributions"
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

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

function resetData (self) {
  self.expand = self.hero.contributor.level;
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [
    saveHero,
  ],
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
