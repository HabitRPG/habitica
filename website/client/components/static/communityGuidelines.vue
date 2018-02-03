<template lang="pug">
  .container-fluid
    h1 {{ $t('communityGuidelines') }}
    hr
    p {{ $t('lastUpdated') }} March 30, 2017

    h2#welcome {{ $t('commGuideHeadingWelcome') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/intro.png')
      .media-body.align-self-center
        p {{ $t('commGuidePara001') }}
        p {{ $t('commGuidePara002') }}
        p {{ $t('commGuidePara003') }}
        p {{ $t('commGuidePara004') }}

    h2#being-habitican {{ $t('commGuideHeadingBeing') }}
    p {{ $t('commGuidePara005') }}
    .media
      .media-body.align-self-center
        ul
          li(v-html="$t('commGuideList01A')")
          li(v-html="$t('commGuideList01B')")
          li(v-html="$t('commGuideList01C')")
          li(v-html="$t('commGuideList01D')")
      img.align-self-center(src='~assets/images/community-guidelines/beingHabitican.png')

    h2#meet-the-mods {{ $t('commGuideHeadingMeet') }}
    p {{ $t('commGuidePara006') }}
    p.strong {{ $t('commGuidePara007') }}
    p.strong {{ $t('commGuidePara008') }}
    p.strong {{ $t('commGuidePara009') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/staff.png')
      .media-body.align-self-center
        ul.list-unstyled
          li.strong {{ $t('commGuideAKA', {habitName: 'Beffymaroo', realName: 'Beth'}) }}
          li.strong {{ $t('commGuideAKA', {habitName: 'Viirus', realName: 'Phillip'}) }}
          li.strong {{ $t('commGuideAKA', {habitName: 'redphoenix', realName: 'Vicky'}) }} ({{ $t('commGuideOnTrello', {trelloName: 'caffeinatedvee'}) }}, {{ $t('commGuideOnGitHub', {gitHubName: 'veeeeeee'}) }})
          li.strong {{ $t('commGuideAKA', {habitName: 'Lemoness', realName: 'Leslie'}) }} ({{ $t('commGuideOnTrello', {trelloName: 'lemonesstree'}) }})
          li.strong {{ $t('commGuideAKA', {habitName: 'SabreCat', realName: 'Sabe'}) }}
          li.strong {{ $t('commGuideAKA', {habitName: 'paglias', realName: 'Matteo'}) }}
          li.strong {{ $t('commGuideAKA', {habitName: 'TheHollidayInn', realName: 'Keith'}) }}
    p {{ $t('commGuidePara010') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/moderators.png')
      .media-body.align-self-center
        p.strong {{ $t('commGuidePara011') }}
        ul.list-unstyled
          li.strong Bailey (It's Bailey {{ $t('commGuidePara011a') }})
          li.strong Ryan (deilann {{ $t('commGuidePara011b') }})
          li.strong Alys (LadyAlys {{ $t('commGuidePara011c') }})
          li.strong Cantras
          li.strong Blade ({{ $t('commGuideOnGitHub', {gitHubName: 'crookedneighbor'}) }})
          li.strong Daniel the Bard
          li.strong shanaqui
          li.strong Dewines
          li.strong Megan
          li.strong Breadstrings
    p(v-html="$t('commGuidePara012', { hrefCommunityManagerEmail })")
    p {{ $t('commGuidePara013') }}
    p {{ $t('commGuidePara014') }}&nbsp;
      em Slappybag, litenull, Shaner, Bobbyroberts99, wc8

    h2#public-spaces {{ $t('commGuideHeadingPublicSpaces') }}
    .media
      .media-body.align-self-center
        p {{ $t('commGuidePara015') }}
        p {{ $t('commGuidePara016') }}
        p(v-html="$t('commGuidePara017')")
      img.align-self-center(src='~assets/images/community-guidelines/publicSpaces.png')
    ul
      li(v-html="$t('commGuideList02A')")
      li(v-html="$t('commGuideList02B')")
      li(v-html="$t('commGuideList02C')")
      li(v-html="$t('commGuideList02D')")
      li(v-html="$t('commGuideList02E')")
      li(v-html="$t('commGuideList02F')")
      li(v-html="$t('commGuideList02G')")
      li(v-html="$t('commGuideList02H', { hrefCommunityManagerEmail })")
      li(v-html="$t('commGuideList02I')")
      li(v-html="$t('commGuideList02J')")
      li(v-html="$t('commGuideList02K', { hrefCommunityManagerEmail })")
    p(v-html="$t('commGuidePara019')")
    p(v-html="$t('commGuidePara020')")
    p(v-html="$t('commGuidePara020A', { hrefCommunityManagerEmail })")
    p(v-html="$t('commGuidePara021')")

    h3#tavern {{ $t('commGuideHeadingTavern') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/tavern.png')
      .media-body.align-self-center
        p {{ $t('commGuidePara022') }}
        p.strong {{ $t('commGuidePara023') }}
        p(v-html="$t('commGuidePara024')")
        p(v-html="$t('commGuidePara027')")

    h3#guilds {{ $t('commGuideHeadingPublicGuilds') }}
    .media
      .media-body.align-self-center
        p(v-html="$t('commGuidePara029')")
        p(v-html="$t('commGuidePara031')")
      img.align-self-center(src='~assets/images/community-guidelines/publicGuilds.png')
    p(v-html="$t('commGuidePara033', { hrefCommunityManagerEmail })")
    p(v-html="$t('commGuidePara035')")
    p.strong {{ $t('commGuidePara037') }}

    h3#back-corner {{ $t('commGuideHeadingBackCorner') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/backCorner.png')
      .media-body.align-self-center
        p(v-html="$t('commGuidePara038')")
        p(v-html="$t('commGuidePara039')")

    h3#trello {{ $t('commGuideHeadingTrello') }}
    .media
      .media-body.align-self-center
        p(v-html="$t('commGuidePara040')")
        p.strong {{ $t('commGuidePara041') }}
        ul
          li(v-html="$t('commGuideList03A')")
          li(v-html="$t('commGuideList03B')")
          li(v-html="$t('commGuideList03C')")
          li(v-html="$t('commGuideList03D')")
      img.align-self-center(src='~assets/images/community-guidelines/trello.png')
    p(v-html="$t('commGuidePara042')")

    h3#github {{ $t('commGuideHeadingGitHub') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/github.gif')
      .media-body.align-self-center
        p(v-html="$t('commGuidePara043')")
        p.strong(v-html="$t('commGuidePara044')")
        ul.list-2col.list-unstyled
          li @alys
          li @crookedneighbor (Blade)
          li @lemoness
          li @paglias
          li @SabreCat
          li @TheHollidayInn
          li @veeeeeee (redphoenix)
          li @vIiRuS

    h3#wiki {{ $t('commGuideHeadingWiki') }}
    .media
      .media-body.align-self-center
        p(v-html="$t('commGuidePara021')") {{ $t('commGuidePara045') }}
        p {{ $t('commGuidePara046') }}
        p.strong {{ $t('commGuidePara047') }}
        p {{ $t('commGuidePara048') }}
      img.align-self-center(src='~assets/images/community-guidelines/wiki.png')
    ul
      li {{ $t('commGuideList04A') }}
      li {{ $t('commGuideList04B') }}
      li {{ $t('commGuideList04C') }}
      li(v-html="$t('commGuidePara020A', { hrefCommunityManagerEmail })")
      li {{ $t('commGuideList04E') }}
      li(v-html="$t('commGuideList04F')")
      li {{ $t('commGuideList04G') }}
      li {{ $t('commGuideList04H') }}
    p {{ $t('commGuidePara049') }}
    ul.list-unstyled
      li LadyAlys (Alys)
      li Sonnet73
      li Taldin
    p {{ $t('commGuidePara049A') }}
    ul.list-unstyled
      li Beffymaroo
      li Cantras
      li Meganstrickland (Megan)
    p {{ $t('commGuidePara018') }}&nbsp;
      em Bobbyroberts99 (founder and bureaucrat), wc8 (bureaucrat), Lefnire (bureaucrat), JiggerD, LadyKatFrog, Breadstrings (bureaucrat), Deilann

    h2#infractions-consequences-restoration {{ $t('commGuideHeadingInfractionsEtc') }}
    h3#infractions {{ $t('commGuideHeadingInfractions') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/infractions.png')
      .media-body.align-self-center
        p {{ $t('commGuidePara050') }}
        p(v-html="$t('commGuidePara051')")
    h4 {{ $t('commGuideHeadingSevereInfractions') }}
    p {{ $t('commGuidePara052') }}
    p {{ $t('commGuidePara053') }}
    ul
      li {{ $t('commGuideList05A') }}
      li {{ $t('commGuideList05B') }}
      li {{ $t('commGuideList05C') }}
      li {{ $t('commGuideList05D') }}
      li {{ $t('commGuideList05E') }}
      li {{ $t('commGuideList05F') }}
    h4 {{ $t('commGuideHeadingModerateInfractions') }}
    p {{ $t('commGuidePara054') }}
    p {{ $t('commGuidePara055') }}
    ul
      li(v-html="$t('commGuidePara020A', { hrefCommunityManagerEmail })")
      li {{ $t('commGuideList06B') }}
      li {{ $t('commGuideList06C') }}
      li {{ $t('commGuideList06D') }}
    h4 {{ $t('commGuideHeadingMinorInfractions') }}
    p {{ $t('commGuidePara056') }}
    p {{ $t('commGuidePara057') }}
    ul
      li {{ $t('commGuideList07A') }}
      li {{ $t('commGuideList07B') }}

    h3#consequences {{ $t('commGuideHeadingConsequences') }}
    .media
      .media-body.align-self-center
        p {{ $t('commGuidePara058') }}
        p(v-html="$t('commGuidePara059')")
        p.strong {{ $t('commGuidePara060') }}
        ul
          li {{ $t('commGuideList08A') }}
          li {{ $t('commGuideList08B') }}
          li {{ $t('commGuideList08C') }}
      img.align-self-center(src='~assets/images/community-guidelines/consequences.png')
    p {{ $t('commGuidePara060A') }}
    p(v-html="$t('commGuidePara060B', { hrefCommunityManagerEmail })")
    h4 {{ $t('commGuideHeadingSevereConsequences') }}
    ul
      li {{ $t('commGuideList09A') }}
      li {{ $t('commGuideList09B') }}
      li {{ $t('commGuideList09C') }}
    h4 {{ $t('commGuideHeadingModerateConsequences') }}
    ul
      li {{ $t('commGuideList10A') }}
        ul
          li {{ $t('commGuideList10A1') }}
      li {{ $t('commGuideList10B') }}
      li {{ $t('commGuideList10C') }}
      li {{ $t('commGuideList10D') }}
      li {{ $t('commGuideList10E') }}
      li {{ $t('commGuideList10F') }}
    h4 {{ $t('commGuideHeadingMinorConsequences') }}
    ul
      li {{ $t('commGuideList11A') }}
      li {{ $t('commGuideList11B') }}
      li {{ $t('commGuideList11C') }}
      li {{ $t('commGuideList11D') }}
      li {{ $t('commGuideList11E') }}

    h3#restoration {{ $t('commGuideHeadingRestoration') }}
    .media
      img.align-self-center(src='~assets/images/community-guidelines/restoration.png')
      .media-body.align-self-center
        p(v-html="$t('commGuidePara061')")
        p(v-html="$t('commGuidePara062')")
        p(v-html="$t('commGuidePara063')")

    h2#contributing {{ $t('commGuideHeadingContributing') }}
    .media
      .media-body.align-self-center
        p {{ $t('commGuidePara064') }}
        ol
          li {{ $t('commGuideList12A') }}
          li {{ $t('commGuideList12B') }}
          li {{ $t('commGuideList12C') }}
          li {{ $t('commGuideList12D') }}
          li {{ $t('commGuideList12E') }}
          li {{ $t('commGuideList12F') }}
          li {{ $t('commGuideList12G') }}
      img.align-self-center(src='~assets/images/community-guidelines/contributing.png')
    p {{ $t('commGuidePara065') }}
    p {{ $t('commGuidePara066') }}
    ul
      li(v-html="$t('commGuideList13A')")
      li(v-html="$t('commGuideList13B')")
      li(v-html="$t('commGuideList13C')")
      li(v-html="$t('commGuideList13D')")

    h2#final {{ $t('commGuideHeadingFinal') }}
    p(v-html="$t('commGuidePara067', { hrefCommunityManagerEmail })")
    p {{ $t('commGuidePara068') }}

    h2#links {{ $t('commGuideHeadingLinks') }}
    ul
      li
        a(href='https://habitica.com/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a' target='_blank') {{ $t('commGuideLink01') }}
        | :&nbsp;{{ $t('commGuideLink01description') }}
      li
        a(href='https://habitica.com/groups/guild/426c2c1a-eed0-4997-9b73-d30fc1397688' target='_blank') {{ $t('commGuideLink02') }}
        | :&nbsp;{{ $t('commGuideLink02description') }}
      li
        span(v-html="$t('commGuideLink03')")
        | :&nbsp;{{ $t('commGuideLink03description') }}
      li
        a(href='https://github.com/HabitRPG/habitrpg' target='_blank') {{ $t('commGuideLink04') }}
        | :&nbsp;{{ $t('commGuideLink04description') }}
      li
        a(href='https://trello.com/b/EpoYEYod/' target='_blank') {{ $t('commGuideLink05') }}
        | :&nbsp;{{ $t('commGuideLink05description') }}
      li
        a(href='https://trello.com/b/mXK3Eavg/' target='_blank') {{ $t('commGuideLink06') }}
        | :&nbsp;{{ $t('commGuideLink06description') }}
      li
        a(href='https://trello.com/b/vwuE9fbO/' target='_blank') {{ $t('commGuideLink07') }}
        | :&nbsp;{{ $t('commGuideLink07description') }}
      li
        a(href='https://trello.com/b/nnv4QIRX/' target='_blank') {{ $t('commGuideLink08') }}
        | :&nbsp;{{ $t('commGuideLink08description') }}
    p.strong {{ $t('commGuidePara069') }}
    ul.list-2col.list-unstyled
      li Breadstrings
      li Draayder
      li Kiwibot
      li Leephon
      li Lemoness
      li Luciferian
      li Revcleo
      li Shaner
      li Starsystemic
      li UncommonCriminal
</template>

<style lang='scss' scoped>
  .list-2col {
    width: 50%;
    columns: 2;
    -moz-columns: 2;
    -webkit-columns: 2;
  }
</style>

<script>
  // @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
  const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';

  export default {
    data () {
      return {
        hrefCommunityManagerEmail: `<a href='mailto: ${COMMUNITY_MANAGER_EMAIL}'>${COMMUNITY_MANAGER_EMAIL}</a>`,
      };
    },
  };
</script>
