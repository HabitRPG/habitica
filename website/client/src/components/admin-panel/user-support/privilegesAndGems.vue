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
        Player has had privilege(s) removed.
      </p>

      <form @submit.prevent="saveHero({hero, msg: 'Privileges or Gems'})">
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
              class="form-control"
              type="number"
              step="0.25"
              :style="{ 'width': '15ch' }"
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
        <input
          type="submit"
          value="Save"
          class="btn btn-primary"
        >
      </form>
    </div>
  </div>
</template>

<script>
import saveHero from '../mixins/saveHero';

function resetData (self) {
  self.errorsOrWarningsExist = false;
  self.expand = false;
  if (self.hero.flags.chatRevoked || self.hero.flags.chatShadowMuted || self.hero.auth.blocked) {
    self.errorsOrWarningsExist = true;
    self.expand = true;
  }
}

export default {
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
