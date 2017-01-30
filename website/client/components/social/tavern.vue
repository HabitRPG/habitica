<template lang="pug">
.ui.grid
  .four.wide.column
    h2.ui.dividing.header SideMenu

    .ui.card
      .content
        .header Daniel
      .content
        h4.ui.sub.header Activity
        | Description
      .extra.content
        button.ui.button Rest at the Inn

    .ui.card
      .content
        .header Resources
      .content
        ul
          li Community Guidelines
          li Looking for Group (Party Wanted) Posts
          li FAQ
          li Glossary
          li Wiki
          li Data Display Tool
          li Report a Problem
          li Request a Feature
          li Community Forum
          li Ask a Question (Habitica Help guild)

    .ui.card
      .content
        .header Resources
      .content
        small
          a(href='/#/options/groups/hall') Visit the Hall of Heroes (contributors and backers)
          br
          a(href='http://habitica.wikia.com/wiki/Contributor_Rewards', target='_blank') Learn more about contributor rewards
          br
          a(href='http://habitica.wikia.com/wiki/Contributing_to_Habitica', target='_blank') Learn how to contribute to Habitica
        table.table.table-striped.panel-tiers
          tbody
            tr
              td
                a.label.label-contributor-1(ng-click='toggleUserTier($event)') Tier 1 (Friend)
                div
                  p
                    span.achievement.achievement-boot
                    | When your
                    strong first
                    |  set of submissions is deployed, you will receive the Habitica Contributor's badge. Your name in Tavern chat will proudly display that you are a contributor. As a bounty for your work, you will also receive
                    strong 3 Gems
                    | .
            tr
              td
                a.label.label-contributor-2(ng-click='toggleUserTier($event)') Tier 2 (Friend)
                div
                  p
                    span.shop-sprite.item-img.shop_armor_special_1
                    | When your
                    strong second
                    |  set of submissions is deployed, the
                    strong Crystal Armor
                    |  will be available for purchase in the Rewards shop. As a bounty for your continued work, you will also receive
                    strong 3 Gems.
            tr
              td
                a.label.label-contributor-3(ng-click='toggleUserTier($event)') Tier 3 (Elite)
                div
                  p
                    span.shop-sprite.item-img.shop_head_special_1
                    | When your
                    strong third
                    |  set of submissions is deployed, the
                    strong Crystal Helmet
                    |  will be available for purchase in the Rewards shop. As a bounty for your continued work, you will also receive
                    strong 3 Gems
                    | .
            tr
              td
                a.label.label-contributor-4(ng-click='toggleUserTier($event)') Tier 4 (Elite)
                div
                  p
                    span.shop-sprite.item-img.shop_weapon_special_1
                    | When your
                    strong fourth
                    |  set of submissions is deployed, the
                    strong Crystal Sword
                    |  will be available for purchase in the Rewards shop. As a bounty for your continued work, you will also receive
                    strong 4 Gems
                    | .
            tr
              td
                a.label.label-contributor-5(ng-click='toggleUserTier($event)') Tier 5 (Champion)
                div
                  p
                    span.shop-sprite.item-img.shop_shield_special_1
                    | When your
                    strong fifth
                    |  set of submissions is deployed, the
                    strong Crystal Shield
                    |  will be available for purchase in the Rewards shop. As a bounty for your continued work, you will also receive
                    strong 4 Gems
                    | .
            tr
              td
                a.label.label-contributor-6(ng-click='toggleUserTier($event)') Tier 6 (Champion)
                div
                  p
                    span.shop-sprite.item-img.Pet-Dragon-Hydra
                    | When your
                    strong sixth
                    |  set of submissions is deployed, you will receive a
                    strong Hydra Pet
                    | . You will also receive
                    strong 4 Gems
                    | .
            tr
              td
                a.label.label-contributor-7(ng-click='toggleUserTier($event)') Tier 7 (Legendary)
                div
                  p
                  | When your
                  strong seventh
                  |  set of submissions is deployed, you will receive
                  strong 4 Gems
                  |  and become a member of the honored Contributor's Guild and be privy to the behind-the-scenes details of Habitica! Further contributions do not increase your tier, but you may continue to earn Gem bounties and titles.
            tr
              td
                a.label.label-contributor-8(ng-click='toggleUserTier($event)') Moderator (Guardian)
                div
                  p
                    | Moderators were selected carefully from high tier contributors, so please give them your respect and listen to their suggestions.
            tr
              td
                a.label.label-contributor-9(ng-click='toggleUserTier($event)') Staff (Heroic)
                div
                  p
                    | The Heroic tier contains Habitica staff and staff-level contributors. If you have this title, you were appointed to it (or hired!).
            tr
              td
                a.label.label-npc(ng-click='toggleUserTier($event)') NPC
                div
                  p
                    | NPCs backed Habitica's Kickstarter at the highest tier. You can find their avatars watching over site features!

    .ui.card
      .content
        .header Challenges
      .content
        ul
          li Challenge 1

  .twelve.wide.column
    h2.ui.dividing.header Tavern Chat
    .ui.comments

      .field
        textarea(v-model='newMessage')
      .ui.blue.labeled.submit.icon.button(v-on:click='sendChat')
        i.icon.edit
        |  Send Chat

      .comment(v-for="message in messages")
        a.avatar
          img(src='http://semantic-ui.com/images/avatar/small/matt.jpg')
        .content
          a.author {{message.from}}
          .metadata
            span.date {{message.date}}
          .text
            | {{message.message}}

</template>

<script>
export default {
  data () {
    // @TODO: Abstract to Store
    let messages = [
      {
        from: 'Paglias',
        fromUserId: 1234,
        to: 'TheHollidayInn',
        message: 'I love the Gang of Four',
        date: new Date(),
      },
    ];

    return {
      messages,
      newMessage: '',
    };
  },

  methods: {
    sendChat: function sendChat () {
      // @TODO: This will be default values based on the conversation and current user
      let messageToSend = {
        from: 'TheHollidayInn',
        fromUserId: 3211,
        to: 'Paglias',
        message: this.newMessage,
        date: new Date(),
      };
      this.messages.push(messageToSend);
      this.newMessage = '';
    },
  },
};
</script>
