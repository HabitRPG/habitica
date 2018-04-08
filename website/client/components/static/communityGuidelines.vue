<template lang="pug">
  .container-fluid
    h1 {{ $t('communityGuidelines') }}
    hr
    p {{ $t('lastUpdated') }} March 29, 2018

    h2#welcome {{ $t('commGuideHeadingWelcome') }}
    .media.align-items-center
      img(src='~assets/images/community-guidelines/intro.png')
      .media-body
        p(v-html="$t('commGuidePara001')")
        p(v-html="$t('commGuidePara002')")
    p(v-html="$t('commGuidePara003')")
    p(v-html="$t('commGuidePara004')")

    h2#interactions {{ $t('commGuideHeadingInteractions') }}
    .media.align-items-center
      .media-body
        p(v-html="$t('commGuidePara015')")
        p(v-html="$t('commGuidePara016')")
      img(src='~assets/images/community-guidelines/publicSpaces.png')
    ul
      li(v-html="$t('commGuideList02A')")
      li(v-html="$t('commGuideList02B')")
      li(v-html="$t('commGuideList02C')")
      li(v-html="$t('commGuideList02D')")
      li(v-html="$t('commGuideList02E')")
      li(v-html="$t('commGuideList02F')")
      li(v-html="$t('commGuideList02G')")
      li(v-html="$t('commGuideList02H')")
      li(v-html="$t('commGuideList02I')")
      li(v-html="$t('commGuideList02J')")
      li(v-html="$t('commGuideList02K')")
      li(v-html="$t('commGuideList02L')")
    p(v-html="$t('commGuidePara019')")
    p(v-html="$t('commGuidePara020')")
    p(v-html="$t('commGuidePara020A')")
    p(v-html="$t('commGuidePara021')")

    h3#tavern {{ $t('commGuideHeadingTavern') }}
    .media.align-items-center
      img(src='~assets/images/community-guidelines/tavern.png')
      .media-body
        p(v-html="$t('commGuidePara022')")
        p(v-html="$t('commGuidePara023')")
        p(v-html="$t('commGuidePara024')")
    .media.align-items-center
      .media-body
        p(v-html="$t('commGuidePara027')")
      img(src='~assets/images/community-guidelines/backCorner.png')

    h3#guilds {{ $t('commGuideHeadingPublicGuilds') }}
    .media.align-items-center
      .media-body
        p(v-html="$t('commGuidePara029')")
        p(v-html="$t('commGuidePara031')")
      img(src='~assets/images/community-guidelines/publicGuilds.png')
    p(v-html="$t('commGuidePara033')")
    p(v-html="$t('commGuidePara035')")
    p(v-html="$t('commGuidePara036')")
    p(v-html="$t('commGuidePara037')")
    p(v-html="$t('commGuidePara038')")

    h2#infractions-consequences-restoration {{ $t('commGuideHeadingInfractionsEtc') }}
    h3#infractions {{ $t('commGuideHeadingInfractions') }}
    .media.align-items-center
      img(src='~assets/images/community-guidelines/infractions.png')
      .media-body
        p(v-html="$t('commGuidePara050')")
        p(v-html="$t('commGuidePara051')")
    h4 {{ $t('commGuideHeadingSevereInfractions') }}
    p(v-html="$t('commGuidePara052')")
    p(v-html="$t('commGuidePara053')")
    ul
      li(v-html="$t('commGuideList05A')")
      li(v-html="$t('commGuideList05B')")
      li(v-html="$t('commGuideList05C')")
      li(v-html="$t('commGuideList05D')")
      li(v-html="$t('commGuideList05E')")
      li(v-html="$t('commGuideList05F')")
      li(v-html="$t('commGuideList05G')")
    h4 {{ $t('commGuideHeadingModerateInfractions') }}
    p(v-html="$t('commGuidePara054')")
    p(v-html="$t('commGuidePara055')")
    ul
      li(v-html="$t('commGuideList06A')")
      li(v-html="$t('commGuideList06B')")
      li(v-html="$t('commGuideList06C')")
      li(v-html="$t('commGuideList06D')")
      li(v-html="$t('commGuideList06E')")
    h4 {{ $t('commGuideHeadingMinorInfractions') }}
    p(v-html="$t('commGuidePara056')")
    p(v-html="$t('commGuidePara057')")
    ul
      li(v-html="$t('commGuideList07A')")
      li(v-html="$t('commGuideList07B')")
    p(v-html="$t('commGuidePara057A')")

    h3#consequences {{ $t('commGuideHeadingConsequences') }}
    .media.align-items-center
      .media-body
        p(v-html="$t('commGuidePara058')")
        p(v-html="$t('commGuidePara059')")
      img(src='~assets/images/community-guidelines/consequences.png')
    p(v-html="$t('commGuidePara060')")
    ul
      li(v-html="$t('commGuideList08A')")
      li(v-html="$t('commGuideList08B')")
      li(v-html="$t('commGuideList08C')")
    p(v-html="$t('commGuidePara060A')")
    p(v-html="$t('commGuidePara060B')")
    h4 {{ $t('commGuideHeadingSevereConsequences') }}
    ul
      li(v-html="$t('commGuideList09A')")
      li(v-html="$t('commGuideList09C')")
    h4 {{ $t('commGuideHeadingModerateConsequences') }}
    ul
      li {{ $t('commGuideList10A') }}
        ul
          li {{ $t('commGuideList10A1') }}
      li(v-html="$t('commGuideList10C')")
      li(v-html="$t('commGuideList10D')")
      li(v-html="$t('commGuideList10E')")
      li(v-html="$t('commGuideList10F')")
    h4 {{ $t('commGuideHeadingMinorConsequences') }}
    ul
      li(v-html="$t('commGuideList11A')")
      li(v-html="$t('commGuideList11B')")
      li(v-html="$t('commGuideList11C')")
      li(v-html="$t('commGuideList11D')")
      li(v-html="$t('commGuideList11E')")

    h3#restoration {{ $t('commGuideHeadingRestoration') }}
    .media.align-items-center
      img(src='~assets/images/community-guidelines/restoration.png')
      .media-body
        p(v-html="$t('commGuidePara061')")
        p(v-html="$t('commGuidePara062')")
    p(v-html="$t('commGuidePara063')")

    h2#meet-the-mods {{ $t('commGuideHeadingMeet') }}
    p(v-html="$t('commGuidePara006')")
    p(v-html="$t('commGuidePara007')")
    p(v-html="$t('commGuidePara008')")
    p(v-html="$t('commGuidePara009')")
    .media.align-items-center
      img(src='~assets/images/community-guidelines/staff.png')
      .media-body
        ul
          li {{ $t('commGuideAKA', {habitName: 'Beffymaroo', realName: 'Beth'}) }}
          li {{ $t('commGuideAKA', {habitName: 'Viirus', realName: 'Phillip'}) }}
          li {{ $t('commGuideAKA', {habitName: 'redphoenix', realName: 'Vicky'}) }} ({{ $t('commGuideOnTrello', {trelloName: 'caffeinatedvee'}) }}, {{ $t('commGuideOnGitHub', {gitHubName: 'veeeeeee'}) }})
          li {{ $t('commGuideAKA', {habitName: 'Lemoness', realName: 'Leslie'}) }} ({{ $t('commGuideOnTrello', {trelloName: 'lemonesstree'}) }})
          li {{ $t('commGuideAKA', {habitName: 'SabreCat', realName: 'Sabe'}) }}
          li {{ $t('commGuideAKA', {habitName: 'paglias', realName: 'Matteo'}) }}
          li {{ $t('commGuideAKA', {habitName: 'TheHollidayInn', realName: 'Keith'}) }}
    p(v-html="$t('commGuidePara010')")
    .media.align-items-center
      img(src='~assets/images/community-guidelines/moderators.png')
      .media-body
        p(v-html="$t('commGuidePara011')")
        ul
          li Bailey (It's Bailey {{ $t('commGuidePara011a') }})
          li Ryan (deilann {{ $t('commGuidePara011b') }})
          li Cantras
          li Alys (LadyAlys {{ $t('commGuidePara011c') }})
          li Fox_town
          li Blade ({{ $t('commGuideOnGitHub', {gitHubName: 'crookedneighbor'}) }})
          li Daniel the Bard
          li shanaqui
          li Dewines
          li Megan
          li Breadstrings
    p(v-html="$t('commGuidePara012')")
    p(v-html="$t('commGuidePara013')")
    p {{ $t('commGuidePara014') }}&nbsp;
      em lefnire, Slappybag, litenull, Shaner, Bobbyroberts99, wc8

    h2#final {{ $t('commGuideHeadingFinal') }}
    p(v-html="$t('commGuidePara067')")
    p(v-html="$t('commGuidePara068')")

    h2#links {{ $t('commGuideHeadingLinks') }}
    ul
      li(v-html="$t('commGuideLink01')")
      li(v-html="$t('commGuideLink02')")
      li(v-html="$t('commGuideLink03')")
      li(v-html="$t('commGuideLink04')")
      li(v-html="$t('commGuideLink05')")
      li(v-html="$t('commGuideLink06')")
      li(v-html="$t('commGuideLink07')")
    p(v-html="$t('commGuidePara069')")
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
