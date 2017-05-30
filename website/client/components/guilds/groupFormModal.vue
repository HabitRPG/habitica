<template lang="pug">
  b-modal#guild-form(:title="title", :hide-footer="true")
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong(v-once) {{$t('name')}}*
        b-form-input(type="text", placeholder="$t('newGuildPlaceHolder')", v-model="newGuild.name")

      .form-group(v-if='newGuild.id')
        label
          strong(v-once) {{$t('guildLeader')}}*
          b-form-select(v-model="newGuild.newLeader" :options="members")

      .form-group
        label
          strong(v-once) {{$t('privacySettings')}}*
        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="newGuild.onlyLeaderCreatesChallenges")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('onlyLeaderCreatesChallenges') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            img(src='~assets/guilds/information.svg')

        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="newGuild.guildLeaderCantBeMessaged")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('guildLeaderCantBeMessaged') }}

        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="newGuild.privateGuild")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('privateGuild') }}
          b-tooltip.icon(:content="$t('privateDescription')")
            img(src='~assets/guilds/information.svg')

        br
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", v-model="newGuild.allowGuildInvationsFromNonMembers")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t('allowGuildInvationsFromNonMembers') }}

      .form-group
        label
          strong(v-once) {{$t('description')}}*
        div.description-count {{charactersRemaining}} {{ $t('charactersRemaining') }}
        b-form-input(type="text", textarea :placeholder="$t('guildDescriptionPlaceHolder')", v-model="newGuild.description")

      .form-group(v-if='newGuild.id')
        label
          strong(v-once) {{$t('guildInformation')}}*
        b-form-input(type="text", textarea :placeholder="$t('guildInformationPlaceHolder')", v-model="newGuild.guildInformation")

      .form-group(style='position: relative;')
        label
          strong(v-once) {{$t('categories')}}*
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
          span.count 4
        button.btn.btn-primary.btn-md(v-if='!newGuild.id', :disabled='!newGuild.name || !newGuild.description') {{ $t('createGuild') }}
        button.btn.btn-primary.btn-md(v-if='newGuild.id', :disabled='!newGuild.name || !newGuild.description') {{ $t('updateGuild') }}
        .gem-description(v-once) {{ $t('guildGemCostInfo') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  textarea {
    height: 150px;
  }

  .description-count, .gem-description {
    font-size: 12px;
    line-height: 1.33;
    text-align: center;
    color: $gray-200;
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
    background-color: $white;
    box-shadow: 0 2px 2px 0 rgba($black, 0.15), 0 1px 4px 0 rgba($black, 0.1);
  }

  .category-label {
    min-width: 100px;
    border-radius: 100px;
    background-color: $gray-600;
    padding: .5em;
    display: inline-block;
    margin-right: .5em;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.33;
    text-align: center;
    color: $gray-300;
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
      color: $green-10;
    }
  }

  .description-count {
    margin-top: 1em;
  }

  .category-select {
    border-radius: 2px;
    background-color: $white;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
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
        id: '',
        name: '',
        type: 'guild',
        privacy: 'private',
        description: '',
        guildInformation: '',
        categories: [],
        onlyLeaderCreatesChallenges: true,
        guildLeaderCantBeMessaged: true,
        privateGuild: true,
        allowGuildInvationsFromNonMembers: true,
        newLeader: '',
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
      members: ['one', 'two'],
    };

    let hashedCategories = {};
    data.categoryOptions.forEach((category) => {
      hashedCategories[category.key] = category.label;
    });
    data.categoriesHashByKey = hashedCategories;

    return data;
  },
  mounted () {
    this.$root.$on('shown::modal', () => {
      let editingGroup = this.$store.state.editingGroup;
      if (!editingGroup) return;
      this.newGuild.name = editingGroup.name;
      this.newGuild.type = editingGroup.type;
      this.newGuild.privacy = editingGroup.privacy;
      if (editingGroup.description) this.newGuild.description = editingGroup.description;
      this.newGuild.id = editingGroup._id;
    });
  },
  computed: {
    charactersRemaining () {
      return 500 - this.newGuild.description.length;
    },
    title () {
      if (!this.newGuild.id) return this.$t('createGuild');
      return this.$t('updateGuild');
    },
  },
  methods: {
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
    async submit () {
      if (this.$store.state.user.data.balance < 1 && !this.newGuild.id) {
        // @TODO: Add proper notifications
        alert('Not enough gems');
        return;
        // @TODO return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});
      }

      if (!this.newGuild.name || !this.newGuild.description) {
        // @TODO: Add proper notifications
        alert('Enter a name and description');
        return;
      }

      if (this.newGuild.description.length > 500) {
        // @TODO: Add proper notifications
        alert('Description is too long');
        return;
      }

      // @TODO: Add proper notifications
      if (!confirm(this.$t('confirmGuild'))) return;

      if (!this.newGuild.privateGuild) {
        this.newGuild.privacy = 'public';
      }

      if (!this.newGuild.onlyLeaderCreatesChallenges) {
        this.newGuild.leaderOnly = {
          challenges: true,
        };
      }

      if (this.newGuild.id) {
        await this.$store.dispatch('guilds:update', {group: this.newGuild});
      } else {
        await this.$store.dispatch('guilds:create', {group: this.newGuild});
      }

      this.$store.state.editingGroup = {};

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
