<template>
  <div class="top-container mx-auto">
    <div class="main-text mr-4">
      <div
        class="title-details"
        role="tablist"
      >
        <div class="row body-text">
          <h1
            v-once
            id="faq-heading"
          >
            {{ $t('frequentlyAskedQuestions') }}
          </h1>
          <div
            v-for="(entry, index) in faq.questions"
            :key="index"
            class="body-text"
          >
            <h2
              v-if="index === 0"
              v-once
            >
              {{ $t('general') }}
            </h2>
            <h2
              v-if="entry.heading === 'party-with-friends'"
              v-once
              id="parties"
            >
              {{ $t('parties') }}
            </h2>
            <h3
              v-once
              v-b-toggle="entry.heading"
              role="tab"
              variant="info"
              @click="handleClick($event)"
            >
              {{ entry.question }}
            </h3>
            <b-collapse
              :id="entry.heading"
              :visible="isVisible(entry.heading)"
              accordion="faq"
              role="tabpanel"
            >
              <div
                v-once
                v-markdown="entry.web"
                class="card-body"
              ></div>
            </b-collapse>
          </div>
          <hr>
          <p
            v-once
            v-markdown="stillNeedHelp"
          ></p>
        </div>
      </div>
    </div>

  <!-- final div! -->
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: #34313a;
    border-bottom: 1px solid #e1e0e3;
    margin-top: 24px;
    padding-bottom: 16px;
  }

  .faq-question {
    a {
      text-decoration: none;
      color: #4F2A93;
    }

    h3 {
      font-size: 16px;
      font-weight: normal;
      line-height: 1.75;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .card-body {
      padding: 0;
      font-size: 14px;
      line-height: 1.71;
      margin-bottom: 1em;
    }
  }

  .container-fluid {
    position: relative;
    top: 2rem;
  }

  .top-container {
    width: 66.67%;
    margin-top: 80px;
    display: flex;

    @media (max-width: 1024px) {
      flex-wrap: wrap;
    }
  }

  .main-text {
    .body-text {
      font-size: 1em;
      color: $gray-10;
      line-height: 1.71;
    }

    .headings {
      font-size: 1.15em;
      font-weight: 400;
      line-height: 1.75;
      color: $purple-200;
    }
  }

  .sidebar {
    height: fit-content;
    width: 330px;
    background-color: $gray-700;
    border-radius: 16px;

    h2 {
      color: $gray-10;
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      line-height: 1.71;
    }

    .staff {
      .staff-icon {
        width: 10px;
        margin-top: 5px;
      }

      .title {
        height: 24px;
        color: $purple-300;
        font-weight: bold;
        display: inline-block;
        margin-bottom: 4px;
      }
    }

    .tier-list {
      list-style-type: none;
      padding: 0;
      width: 282px;
      font-size: 1em !important;

      li {
        height: 40px;
        border-radius: 4px;
        border: solid 1px $gray-500;
        text-align: center;
        padding: 8px 0;
        margin-bottom: 8px;
        margin-right: 4px;
        font-weight: bold;
        line-height: 1.71;
      }

      .tier1 {
        color: #c42870;
        .svg-icon {
          width: 11px;
          margin-top: 5px;
        }
      }

      .tier2 {
        color: #b01515;
        .svg-icon {
          width: 11px;
          margin-top: 5px;
        }
      }

      .tier3 {
        color: #d70e14;
        .svg-icon {
          width: 13px;
          margin-top: 4px;
        }
      }

      .tier4 {
        color: #c24d00;
        .svg-icon {
          width: 13px;
          margin-top: 4px;
        }
      }

      .tier5 {
        color: #9e650f;
        .svg-icon {
          width: 8px;
          margin-top: 7px;
        }
      }

      .tier6 {
        color: #2b8363;
        .svg-icon {
          width: 8px;
          margin-top: 7px;
        }
      }

      .tier7 {
        color: #167e87;
        .svg-icon {
          width: 12px;
          margin-top: 4px;
        }
      }

      .moderator {
        color: #277eab;
        .svg-icon {
          width: 13px;
          margin-top: 3px;
        }
      }

      .staff {
        color: #6133b4;
        .svg-icon {
          width: 10px;
          margin-top: 7px;
        }
      }

      .npc {
        color: $black;
      }
    }

    .gradient {
      position: absolute;
      width: 330px;
      height: 100px;
      margin: -1px 0 116px;
      background-image: linear-gradient(to bottom, $gray-700 0%, rgba(249, 249, 249, 0) 100%);
    }

    .grassy-meadow-backdrop {
      background-repeat: repeat-x;
      width: 330px;
      height: 246px;
    }

    .daniel_front {
      height: 246px;
      width: 330px;
      background-repeat: no-repeat;
      margin: 0 auto;
    }

    .pixel-border {
      width: 330px;
      height: 30px;
      background-repeat: no-repeat;
      position: absolute;
      margin-top: -30px;
    }

    .question {
      font-size: 1em;
      font-weight: bold;
      line-height: 1.71;
      color: $gray-10;
      margin-top: 24px;
    }

    .contact p {
      font-size: 1em;
      margin-bottom: 0px;
    }
  }

</style>

<script>
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      faq: {},
      headings: [],
      stillNeedHelp: '',
    };
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('help'),
      subSection: this.$t('faq'),
    });
    this.faq = await this.$store.dispatch('faq:getFAQ');
    for (const entry of this.faq.questions) {
      this.headings.push(entry.heading);
    }
    this.stillNeedHelp = this.faq.stillNeedHelp.web;
  },
  methods: {
    isVisible (heading) {
      const hash = window.location.hash.replace('#', '');
      return hash && this.headings.includes(hash) && hash === heading;
    },
    handleClick (e) {
      if (!e) return;
      const heading = e.target.nextElementSibling.id;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
