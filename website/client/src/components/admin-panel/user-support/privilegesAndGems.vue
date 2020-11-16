<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Privileges, Gem Balance
    </h3>
    <div v-if="expand">
      <p
        v-if="errorsOrWarningsExist"
        class="errorMessage"
      >
        Player has had privileges removed or has moderation notes.
      </p>

      <form @submit.prevent="saveHero({hero, msg: 'Privileges or Gems or Moderation Notes'})">
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
          <label>
            Balance
            <input
              v-model="hero.balance"
              class="form-control balanceField"
              type="number"
              step="0.25"
            >
          </label>
          <span>
            <small>
              Balance is in USD, not in Gems.
              E.g., if this number is 1, it means 4 Gems.
              Arrows change Balance by 0.25 (i.e., 1 Gem per click).
              Do not use when awarding tiers; tier gems are automatic.
            </small>
          </span>
        </div>
        <div class="form-group">
          <label>Moderation Notes</label>
          <textarea
            v-model="hero.secret.text"
            class="form-control"
            cols="5"
            rows="5"
          ></textarea>
          <div
            v-markdown="hero.secret.text"
            class="markdownPreview"
          ></div>
        </div>
        <input
          type="submit"
          value="Save"
          class="btn btn-primary"
        >
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .balanceField {
    min-width: 15ch;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

function resetData (self) {
  self.errorsOrWarningsExist = false;
  self.expand = false;
  if (self.hero.flags.chatRevoked || self.hero.flags.chatShadowMuted || self.hero.auth.blocked
      || (self.hero.secret.text && !self.hero.contributor.level)) {
    // We automatically expand this section if the user has had privileges removed.
    // We also expand if they have secret.text UNLESS they have a contributor tier because
    // in that case the notes are probably about their contributions and can be seen in the
    // Contributor Details section (which will be automatically expanded because of their tier).
    self.errorsOrWarningsExist = true;
    self.expand = true;
  }
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
      errorsOrWarningsExist: false,
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
