<template lang="pug">
.row
  .col-12
    nav.nav.sub-nav
      .col-md-6.offset-md-4
        router-link.nav-link(:to="{name: 'tavern'}", exact, :class="{'active': $route.name === 'tavern'}") {{ $t('tavern') }}
        router-link.nav-link(:to="{name: 'myGuilds'}", :class="{'active': $route.name === 'myGuilds'}") {{ $t('myGuilds') }}
        router-link.nav-link(:to="{name: 'guildsDiscovery'}", :class="{'active': $route.name === 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
      .col-md-2
        button.btn.btn-primary.btn-purple(b-btn, @click="$root.$emit('show::modal','modal1')") {{ $t('createGuild') }}
  .col-12
    router-view

  b-modal#modal1(:title="$t('createGuild')", :hide-footer="true")
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong {{$t('name')}}*
        b-form-input(type="text", placeholder="Enter your name", v-model="newGuild.name")

      .form-group
        label
          strong {{$t('privacySettings')}}*
        br
        b-form-checkbox(v-model='newGuild.onlyLeaderCreatesChallenges') {{$t('onlyLeaderCreatesChallenges')}}
        br
        b-form-checkbox(v-model='newGuild.guildLeaderCantBeMessaged') {{$t('guildLeaderCantBeMessaged')}}
        br
        b-form-checkbox(v-model='newGuild.privateGuild') {{$t('privateGuild')}}
        br
        b-form-checkbox(v-model='newGuild.allowGuildInvationsFromNonMembers') {{$t('allowGuildInvationsFromNonMembers')}}

      .form-group
        label
          strong {{$t('description')}}*
        div.description-count {{charactersRemaining}} {{ $t('charactersRemaining') }}
        b-form-input(type="text", textarea :placeholder="$t('guildDescriptionPlaceHolder')", v-model="newGuild.description")

      .form-group(style='position: relative;')
        label
          strong {{$t('categories')}}*
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='newGuild.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in newGuild.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value='group.key' v-model="newGuild.categories")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}

      .form-group.text-center
        div.item-with-icon
          img(src="~assets/guilds/green-gem.svg")
          span.count 2
        button.btn.btn-primary.btn-md {{ $t('createGuild') }}
        div.gem-description
          | {{ $t('guildGemCostInfo') }}
</template>

<style lang="scss" scoped>
  body {
    background-color: #f9f9f9
  }

  textarea {
    height: 150px;
  }

  .sub-nav {
    height: 56px;
    background-color: #edecee;
    box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.2);
    text-align: center;
    position: relative;
    z-index: 1;

    a {
      font-size: 16px;
      font-weight: bold;
      line-height: 1.5;
      color: #4e4a57;
      padding: 1em;
      float: left;
    }

    a.active {
      color: #6133b4;
      border-bottom: 4px solid #6133b4;
    }
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

  .description-count, .gem-description {
    font-size: 12px;
    line-height: 1.33;
    text-align: center;
    color: #878190;
  }

  .description-count {
    text-align: right;
  }

  .gem-description {
    margin-top: 1em;
  }

  .category-box {
    padding: 1em;
    max-width: 400px;
    position: absolute;
    top: -340px;
    padding: 2em;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  }

  .category-label {
    min-width: 100px;
    border-radius: 100px;
    background-color: #edecee;
    padding: .5em;
    display: inline-block;
    margin-right: .5em;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.33;
    text-align: center;
    color: #a5a1ac;
  }

  .item-with-icon {
    display: inline-block;

    img {
      height: 20px;
      margin-right: .5em;
    }

    .count {
      font-size: 14px;
      font-weight: bold;
      margin-right: 1em;
      color: #24cc8f;
    }
  }

  .description-count {
    margin-top: 1em;
  }

  .category-select {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 1em;
  }

  .category-wrap {
    margin-top: .5em;
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
    let data = {
      newGuild: {
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvationsFromNonMembers: true,
      },
      categoryOptions: [
        {
          label: 'habiticaOfficial',
          key: 'official',
        },
        {
          label: 'animals',
          key: 'animals',
        },
        {
          label: 'artDesign',
          key: 'art_design',
        },
        {
          label: 'booksWriting',
          key: 'books_writing',
        },
        {
          label: 'comicsHobbies',
          key: 'comics_hobbies',
        },
        {
          label: 'diyCrafts',
          key: 'diy_crafts',
        },
        {
          label: 'education',
          key: 'education',
        },
        {
          label: 'foodCooking',
          key: 'food_cooking',
        },
        {
          label: 'healthFitness',
          key: 'health_fitness',
        },
        {
          label: 'music',
          key: 'music',
        },
        {
          label: 'relationship',
          key: 'relationship',
        },
        {
          label: 'scienceTech',
          key: 'science_tech ',
        },
      ],
      showCategorySelect: false,
    };

    let hashedCategories = {};
    data.categoryOptions.forEach((category) => {
      hashedCategories[category.key] = category.label;
    });
    data.categoriesHashByKey = hashedCategories;

    return data;
  },
  computed: {
    charactersRemaining () {
      return 500 - this.newGuild.description.length;
    },
  },
  methods: {
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
    async submit () {
      if (this.$store.state.user.data.balance < 1) {
        alert('Not enough gems');
        return;
        // return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});
      }

      if (!this.newGuild.name || !this.newGuild.description) {
        alert('Enter a name and description');
        return;
      }

      if (this.newGuild.description.length > 500) {
        alert('Description is too long');
        return;
      }

      //  $t('confirmGuild')
      if (!confirm('Confirm?')) return;

      if (!this.newGuild.privateGuild) {
        this.newGuild.privacy = 'public';
      }

      if (!this.newGuild.onlyLeaderCreatesChallenges) {
        this.newGuild.leaderOnly = {
          challenges: true,
        };
      }

      await this.$store.dispatch('guilds:create', {group: this.newGuild});

      this.newGuild = {
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvationsFromNonMembers: true,
      };
    },
  },
};
</script>
