<template>
  <b-modal
    id="welcome"
    :title="$t('welcomeToHabit')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-body container-fluid">
      <div class="row">
        <div class="col-4 col-centered">
          <span style="display:flex">
            <h1>&#9312;</h1>
            <h3 style="margin:auto auto auto .5em">{{ $t('welcome1') }}</h3>
          </span>
          <div
            class="welcome_basic_avatars"
            style="margin: 1.5em auto 1.5em"
          ></div>
          <h4>{{ $t('welcome1notes') }}</h4>
        </div>
        <div class="col-4 col-centered">
          <span style="display:flex">
            <h1>&#9313;</h1>
            <h3 style="margin:.3em auto auto .5em">{{ $t('welcome2') }}</h3>
          </span>
          <div
            class="welcome_sample_tasks"
            style="margin: 2.5em auto 1.5em"
          ></div>
          <h4>{{ $t('welcome2notes') }}</h4>
        </div>
        <div class="col-4 col-centered">
          <span style="display:flex">
            <h1>&#9314;</h1>
            <h3 style="margin:auto auto auto .5em">{{ $t('welcome3') }}</h3>
          </span>
          <div
            class="welcome_promo_party"
            style="margin: 1em auto 1em"
          ></div>
          <h4>{{ $t('welcome3notes') }}</h4>
        </div>
      </div>
    </div>
    <div
      class="modal-footer text-center"
      style="margin-top:0"
    >
      <div class="col-3"></div>
      <div class="col-6">
        <button
          class="btn btn-primary btn-lg flex-column"
          @click="ready()"
        >
          {{ $t('enterHabitica') }}
        </button>
      </div>
      <div class="col-3"></div>
    </div>
  </b-modal>
</template>

<script>
export default {
  methods: {
    ready () {
      // Guide.goto("intro",0)'
      this.$router.push('/avatar');
      this.$root.$emit('bv::hide::modal', 'welcome');
    },
  },
};
</script>
