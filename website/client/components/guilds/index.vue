<template lang="pug">
.row
  .col-12
    nav.nav.sub-nav
      .col-md-6.offset-md-4
        router-link.nav-link(:to="{name: 'tavern'}", exact, :class="{'active': $route.name === 'tavern'}") {{ $t('tavern') }}
        router-link.nav-link(:to="{name: 'myGuilds'}", :class="{'active': $route.name === 'myGuilds'}") {{ $t('myGuilds') }}
        router-link.nav-link(:to="{name: 'guildsDiscovery'}", :class="{'active': $route.name === 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
      .col-md-2
        button.btn.btn-primary.btn-purple(b-btn, @click="$root.$emit('show::modal','modal1')") Create Guild
  .col-12
    router-view

  b-modal#modal1(title="Create a Guild", @ok="submit", @shown="clearName")
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong Name*
        b-form-input(type="text", placeholder="Enter your name", v-model="newGuild.name")

      .form-group
        label
          strong Privacy Settings*
        br
        b-form-checkbox Only the Guild Leader can create Guild Challenges
        b-form-checkbox Guild Leader can not be messaged directly
        b-form-checkbox Private Guild
        b-form-checkbox Allow Guild invitations from non-members

      .form-group
        label
          strong Description*
        div.description-count 500 characters remaining
        b-form-input(type="text", textarea placeholder="Write a short description advertising your Guild to other Habiticans. What is the main purpose of your Guild and why should people join it? Try to include useful keywords in the description so that Habiticans can easily find it when they search!", v-model="newGuild.description")

      .form-group
        label
          strong Categories*
        b-form-select(class="mb-3", :options="options")
          | None
        .category-box
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges
          b-form-checkbox Only the Guild Leader can create Guild Challenges

      .form-group
        div.item-with-icon
          img(src="data:image/png;base64,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"
          )
          span 2
        button.btn.btn-primary.btn-md Create Guild
        div.description-count
          | A Gem cost promotes high quality Guilds and is transferred into your Guild's bank.
</template>

<style>
  body {
    background-color: #f9f9f9
  }

  .sub-nav {
    height: 56px;
    background-color: #edecee;
    box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.2);
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .sub-nav a {
    font-size: 16px;
    font-weight: bold;
    line-height: 1.5;
    color: #4e4a57;
    padding: 1em;
    float: left;
  }

  .sub-nav a.active {
    color: #6133b4;
    border-bottom: 4px solid #6133b4;
  }

  .btn-purple {
    margin: .5em;
    border-radius: 2px;
    background-color: #4f2a93;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    font-weight: bold;
  }

  .btn-purple:hover, .btn-purple:active {
    background-color: #4f2a93;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  }

  .description-count {
    font-size: 12px;
    line-height: 1.33;
    text-align: right;
    color: #878190;
  }

  .category-box {
    padding: 1em;
    max-width: 400px;
    position: absolute;
    top: -84px;
    padding: 2em;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bBtn from 'bootstrap-vue/lib/components/button';
import bFormInput from 'bootstrap-vue/lib/components/form-input';
import bFormCheckbox from 'bootstrap-vue/lib/components/form-checkbox';
import bFormSelect from 'bootstrap-vue/lib/components/form-select';

export default {
  components: {
    bModal,
    bBtn,
    bFormInput,
    bFormCheckbox,
    bFormSelect,
  },
  data () {
    return {
      newGuild: {
        name: '',
        description: '',
      },
      options: {
        '': 'None',
      }
    };
  },
  methods: {
    submit () {

    },
    clearName () {

    },
  },
};
</script>
