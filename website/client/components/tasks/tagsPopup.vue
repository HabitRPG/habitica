<template lang="pug">
.tags-popup
  .tags-category.d-flex
    .tags-header
      strong(v-once) {{ $t('tags') }}
    .tags-list.container
      .row
        .col-4(v-for="tag in tags")
          .custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", :value="tag.id", v-model="selectedTags", :id="`tag-${tag.id}`")
            label.custom-control-label(:title="tag.name", :for="`tag-${tag.id}`") {{tag.name}}
  .tags-footer
    span.clear-tags(@click="clearTags()") {{$t("clearTags")}}
    span.close-tags(@click="close()") {{$t("close")}}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .tags-popup {
    padding-left: 24px;
    padding-right: 24px;
    width: 593px;
    z-index: 9999;
    background: $white;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    font-size: 14px;
    line-height: 1.43;
    text-overflow: ellipsis;

    .tags-category {
      border-bottom: 1px solid $gray-600;
      padding-bottom: 24px;
      padding-top: 24px;
    }

    .tags-header {
       flex-basis: 96px;
       flex-shrink: 0;

      a {
        font-size: 12px;
        line-height: 1.33;
        color: $blue-10;
        margin-top: 4px;

        &:focus, &:hover, &:active {
          text-decoration: underline;
        }
      }
    }

    .tags-list {
      .custom-control-label {
        color: $gray-50 !important;
        font-weight: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: pre;
        width: 8em;
      }
    }

    .tags-footer {
      border-top: 1px solid $gray-600;

      display: flex;
      justify-content: center;

      .close-tags {
        color: $blue-10;
        margin: 1.1em 0;
        margin-left: 2em;
        font-size: 14px;

        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }

      .clear-tags {
        cursor: pointer;
        margin: 1.1em 0;
        color: $red-50;
        font-size: 14px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>

<script>
export default {
  props: ['tags', 'value'],
  data () {
    return {
      selectedTags: [],
    };
  },
  watch: {
    selectedTags () {
      this.$emit('input', this.selectedTags);
    },
  },
  mounted () {
    this.selectedTags = this.value;
  },
  methods: {
    clearTags () {
      this.selectedTags = [];
    },
    close () {
      this.$emit('close');
    },
  },
};
</script>
