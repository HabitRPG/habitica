<template lang="pug">
.standard-page(v-if='user.contributor.admin')
  div
    .row
      .form.col-6(submit='savePost(post)')
        .form-group
          input.form-control(type='text', v-model='post.title', :placeholder="$t('title')")
        .form-group
          label {{ $t('isPublished') }}
          input.form-control(type='checkbox', v-model='post.published')
        .form-group
          datepicker(
            v-model="post.publishDate",
            :calendarIcon="icons.calendar",
            :todayButtonText='$t("today")',
          )
        .form-group
          label {{ $t('newsText') }}
          textarea.form-control(rows=10, v-model='post.text')
        .form-group
          label {{ $t('credits') }}
          textarea.form-control(rows=2, v-model='post.credits')
        hr
        .form-group
          button.form-control.btn.btn-primary(@click='savePost()')
            | {{ $t('save') }}
      .col-6
        h2 {{ post.title }}
        div(v-if='post.text' v-markdown='post.text', target='_blank')
        small(v-if='post.credits' v-markdown='post.credits', target='_blank')
  h2 {{ $t('baileyHistory') }}
  .table-responsive
    table.table.table-striped
      thead
        th(width='120px') {{ $t('isPublished') }}
        th(width='150px') {{ $t('publishDate') }}
        th {{ $t('title') }}
      tbody
        tr.table-row(v-for='(post, index) in posts', @click='clickPost(post)')
          td
            .svg-icon(v-html="icons.checkmark", v-if="post.published")
            .svg-icon(v-html="icons.close", v-if="!post.published")
          td {{post.publishDate | date}}
          td
            a()
              | {{post.title}}&nbsp;
</template>

<script>
  import markdownDirective from 'client/directives/markdown';
  import styleHelper from 'client/mixins/styleHelper';
  import { mapState } from 'client/libs/store';
  import notifications from 'client/mixins/notifications';
  import Datepicker from 'vuejs-datepicker';
  import checkmarkIcon from 'assets/svg/check.svg';
  import closeIcon from 'assets/svg/close.svg';
  import calendarIcon from 'assets/svg/calendar.svg';
  import moment from 'moment';

  export default {
    components: {
      Datepicker,
    },
    mixins: [notifications, styleHelper],
    data () {
      return {
        posts: [],
        post: {
          publishDate: Date(),
          published: false,
        },
        postID: '',
        icons: Object.freeze({
          close: closeIcon,
          checkmark: checkmarkIcon,
          calendar: calendarIcon,
        }),
      };
    },
    directives: {
      markdown: markdownDirective,
    },
    filters: {
      date (value) {
        // @TODO: Vue doesn't support this so we cant user preference
        return moment(value).format('ll');
      },
    },
    async mounted () {
      this.loadPosts();
    },
    computed: {
      ...mapState({user: 'user.data'}),
    },
    methods: {
      async loadPosts () {
        this.posts = await this.$store.dispatch('news:getNews');
      },
      async savePost () {
        if (!this.post.published) {
          this.post.published = false;
        }
        let route = this.postID.length > 0 ? 'news:updateNewsPost' : 'news:createNewsPost';
        let savedPost = await this.$store.dispatch(route, {postDetails: this.post});
        if (savedPost) {
          this.post = {};
          this.postID = -1;
        }
        this.loadPosts();
      },
      async clickPost (clickedPost) {
        this.post = Object.assign({}, clickedPost);
        this.postID = this.post._id;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .table-row > td > .svg-icon {
    width: 24px;
    height: 24px;
  }
</style>
