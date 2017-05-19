<template lang="pug">
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
          b-tooltip.icon(:content="$t('privateDescription')")
            img(src='~assets/guilds/information.svg')
        br
        b-form-checkbox(v-model='newGuild.guildLeaderCantBeMessaged') {{$t('guildLeaderCantBeMessaged')}}
        br
        b-form-checkbox(v-model='newGuild.privateGuild') {{$t('privateGuild')}}
          b-tooltip.icon(:content="$t('privateDescription')")
            img(src='~assets/guilds/information.svg')
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
        button.btn.btn-primary.btn-md(:disabled='!newGuild.name || !newGuild.description') {{ $t('createGuild') }}
        div.gem-description
          | {{ $t('guildGemCostInfo') }}
</template>

<style lang="scss" scoped>
  textarea {
    height: 150px;
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
    top: -480px;
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

  .category-select:hover {
    cursor: pointer;
  }

  .category-wrap {
    margin-top: .5em;
  }

  .icon {
    margin-left: .5em;
    display: inline-block;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bBtn from 'bootstrap-vue/lib/components/button';
import bFormInput from 'bootstrap-vue/lib/components/form-input';
import bFormCheckbox from 'bootstrap-vue/lib/components/form-checkbox';
import bFormSelect from 'bootstrap-vue/lib/components/form-select';
import bTooltip from 'bootstrap-vue/lib/components/tooltip';

export default {
  components: {
    bModal,
    bBtn,
    bFormInput,
    bFormCheckbox,
    bFormSelect,
    bTooltip,
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
