<template lang="pug">
.row
  footer.container-fluid
    .row
      .col-2
        h3 iOS App
        h3 Android App
      .col-2
        h3 Company
        ul
          li How it Works
          li Blog
          li Tumblr
          li FAQ
          li News
          li Merchandis
          li Press Kit
          li Contact Us
      .col-2
        h3 Community
        ul
          li Community Guidelines
          li Submit a Bug
          li Request a Feature
          li Add-Ons & Extensions
          li Forum
          li Kickstarter
          li Facebook
          li Reddit
      .col-6
        .row
          .col-6
            h3 Developers
            ul
              li APIv3
              li Data Display Tool
              li Guidance for Blacksmiths
              li The Forge - Developer Blog
          .col-6
            h3 Social
            span Twitter
            span Instagram
            span Facebook
        .row
          .col-8
            | We’re an open source project that depends on our users for support. The money you donate helps us keep the servers running, maintain a small staff, develop new features, and provide incentives for our volunteers.
          .col-4
            | Donate
    .row
      hr.col-12
    .row
      .col-4
        | © 2017 Habitica. All rights reserved.
      .col-4
        | Logo
      .col-4
        span Privacy Policy
        span Terms of Use
</template>

<style scoped>
  footer {
    background-color: #e1e0e3;
    height: 376px;
    padding-left: 6em;
    padding-right: 6em;
    padding-top: 3em;
    margin: 0;
  }
</style>

<script>
export default {
  methods: {
    // @TODO: add https://github.com/HabitRPG/habitica/blob/develop/website/client-old/js/controllers/footerCtrl.js
  },
};
</script>
