<template>
  <div class="tags-popup">
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <div
      v-for="tagsType in tagsByType"
      v-if="tagsType.tags.length > 0 || tagsType.key === 'tags'"
      :key="tagsType.key"
      class="tags-category d-flex"
    >
      <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      <div class="tags-header">
        <strong v-once>{{ $t(tagsType.key) }}</strong>
      </div>
      <div class="tags-list container">
        <div class="row">
          <div
            v-for="(tag) in tagsType.tags"
            :key="tag.id"
            class="col-4"
          >
            <div class="custom-control custom-checkbox">
              <input
                :id="`tag-${tag.id}`"
                v-model="selectedTags"
                class="custom-control-input"
                type="checkbox"
                :value="tag.id"
              >
              <label
                v-markdown="tag.name"
                class="custom-control-label"
                :title="tag.name"
                :for="`tag-${tag.id}`"
              ></label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tags-footer">
      <span
        class="clear-tags"
        @click="clearTags()"
      >{{ $t("clearTags") }}</span>
      <span
        class="close-tags"
        @click="close()"
      >{{ $t("close") }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  props: ['tags', 'value'],
  data () {
    return {
      selectedTags: [],
    };
  },
  computed: {
    tagsByType () {
      const tagsByType = {
        challenges: {
          key: 'challenges',
          tags: [],
        },
        groups: {
          key: 'groups',
          tags: [],
        },
        user: {
          key: 'tags',
          tags: [],
        },
      };
      this.$props.tags.forEach(t => {
        if (t.group) {
          tagsByType.groups.tags.push(t);
        } else if (t.challenge) {
          tagsByType.challenges.tags.push(t);
        } else {
          tagsByType.user.tags.push(t);
        }
      });
      return tagsByType;
    },
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
