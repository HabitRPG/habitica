<template>
  <div class="container-fluid">
    <h1>{{ $t('communityGuidelines') }}</h1>
    <hr>
    <p>{{ $t('lastUpdated') }} March 29, 2018</p>
    <h2 id="welcome">
      {{ $t('commGuideHeadingWelcome') }}
    </h2>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/intro.png">
      <div class="media-body">
        <p v-html="$t('commGuidePara001')"></p>
        <p v-html="$t('commGuidePara002')"></p>
      </div>
    </div>
    <p v-html="$t('commGuidePara003')"></p>
    <p v-html="$t('commGuidePara004')"></p>
    <h2 id="interactions">
      {{ $t('commGuideHeadingInteractions') }}
    </h2>
    <div class="media align-items-center">
      <div class="media-body">
        <p v-html="$t('commGuidePara015')"></p>
        <p v-html="$t('commGuidePara016')"></p>
      </div>
      <img src="~@/assets/images/community-guidelines/publicSpaces.png">
    </div>
    <ul>
      <li v-html="$t('commGuideList02A')"></li>
      <li v-html="$t('commGuideList02B')"></li>
      <li v-html="$t('commGuideList02C')"></li>
      <li v-html="$t('commGuideList02D')"></li>
      <li v-html="$t('commGuideList02E')"></li>
      <li v-html="$t('commGuideList02F')"></li>
      <li v-html="$t('commGuideList02G')"></li>
      <li v-html="$t('commGuideList02H')"></li>
      <li v-html="$t('commGuideList02I')"></li>
      <li v-html="$t('commGuideList02J')"></li>
      <li v-html="$t('commGuideList02K')"></li>
      <li v-html="$t('commGuideList02L')"></li>
    </ul>
    <p v-html="$t('commGuidePara019')"></p>
    <p v-html="$t('commGuidePara020')"></p>
    <p v-html="$t('commGuidePara020A')"></p>
    <p v-html="$t('commGuidePara021')"></p>
    <h3 id="tavern">
      {{ $t('commGuideHeadingTavern') }}
    </h3>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/tavern.png">
      <div class="media-body">
        <p v-html="$t('commGuidePara022')"></p>
        <p v-html="$t('commGuidePara023')"></p>
        <p v-html="$t('commGuidePara024')"></p>
      </div>
    </div>
    <div class="media align-items-center">
      <div class="media-body">
        <p v-html="$t('commGuidePara027')"></p>
      </div>
      <img src="~@/assets/images/community-guidelines/backCorner.png">
    </div>
    <h3 id="guilds">
      {{ $t('commGuideHeadingPublicGuilds') }}
    </h3>
    <div class="media align-items-center">
      <div class="media-body">
        <p v-html="$t('commGuidePara029')"></p>
        <p v-html="$t('commGuidePara031')"></p>
      </div>
      <img src="~@/assets/images/community-guidelines/publicGuilds.png">
    </div>
    <p v-html="$t('commGuidePara033')"></p>
    <p v-html="$t('commGuidePara035')"></p>
    <p v-html="$t('commGuidePara036')"></p>
    <p v-html="$t('commGuidePara037')"></p>
    <p v-html="$t('commGuidePara038')"></p>
    <h2 id="infractions-consequences-restoration">
      {{ $t('commGuideHeadingInfractionsEtc') }}
    </h2>
    <h3 id="infractions">
      {{ $t('commGuideHeadingInfractions') }}
    </h3>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/infractions.png">
      <div class="media-body">
        <p v-html="$t('commGuidePara050')"></p>
        <p v-html="$t('commGuidePara051')"></p>
      </div>
    </div>
    <h4>{{ $t('commGuideHeadingSevereInfractions') }}</h4>
    <p v-html="$t('commGuidePara052')"></p>
    <p v-html="$t('commGuidePara053')"></p>
    <ul>
      <li v-html="$t('commGuideList05A')"></li>
      <li v-html="$t('commGuideList05B')"></li>
      <li v-html="$t('commGuideList05C')"></li>
      <li v-html="$t('commGuideList05D')"></li>
      <li v-html="$t('commGuideList05E')"></li>
      <li v-html="$t('commGuideList05F')"></li>
      <li v-html="$t('commGuideList05G')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingModerateInfractions') }}</h4>
    <p v-html="$t('commGuidePara054')"></p>
    <p v-html="$t('commGuidePara055')"></p>
    <ul>
      <li v-html="$t('commGuideList06A')"></li>
      <li v-html="$t('commGuideList06B')"></li>
      <li v-html="$t('commGuideList06C')"></li>
      <li v-html="$t('commGuideList06D')"></li>
      <li v-html="$t('commGuideList06E')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingMinorInfractions') }}</h4>
    <p v-html="$t('commGuidePara056')"></p>
    <p v-html="$t('commGuidePara057')"></p>
    <ul>
      <li v-html="$t('commGuideList07A')"></li>
      <li v-html="$t('commGuideList07B')"></li>
    </ul>
    <p v-html="$t('commGuidePara057A')"></p>
    <h3 id="consequences">
      {{ $t('commGuideHeadingConsequences') }}
    </h3>
    <div class="media align-items-center">
      <div class="media-body">
        <p v-html="$t('commGuidePara058')"></p>
        <p v-html="$t('commGuidePara059')"></p>
      </div>
      <img src="~@/assets/images/community-guidelines/consequences.png">
    </div>
    <p v-html="$t('commGuidePara060')"></p>
    <ul>
      <li v-html="$t('commGuideList08A')"></li>
      <li v-html="$t('commGuideList08B')"></li>
      <li v-html="$t('commGuideList08C')"></li>
    </ul>
    <p v-html="$t('commGuidePara060A')"></p>
    <p v-html="$t('commGuidePara060B')"></p>
    <h4>{{ $t('commGuideHeadingSevereConsequences') }}</h4>
    <ul>
      <li v-html="$t('commGuideList09A')"></li>
      <li v-html="$t('commGuideList09C')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingModerateConsequences') }}</h4>
    <ul>
      <li>
        {{ $t('commGuideList10A') }}
        <ul>
          <li>{{ $t('commGuideList10A1') }}</li>
        </ul>
      </li>
      <li v-html="$t('commGuideList10C')"></li>
      <li v-html="$t('commGuideList10D')"></li>
      <li v-html="$t('commGuideList10E')"></li>
      <li v-html="$t('commGuideList10F')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingMinorConsequences') }}</h4>
    <ul>
      <li v-html="$t('commGuideList11A')"></li>
      <li v-html="$t('commGuideList11B')"></li>
      <li v-html="$t('commGuideList11C')"></li>
      <li v-html="$t('commGuideList11D')"></li>
      <li v-html="$t('commGuideList11E')"></li>
    </ul>
    <h3 id="restoration">
      {{ $t('commGuideHeadingRestoration') }}
    </h3>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/restoration.png">
      <div class="media-body">
        <p v-html="$t('commGuidePara061')"></p>
        <p v-html="$t('commGuidePara062')"></p>
      </div>
    </div>
    <p v-html="$t('commGuidePara063')"></p>
    <h2 id="meet-the-mods">
      {{ $t('commGuideHeadingMeet') }}
    </h2>
    <p v-html="$t('commGuidePara006')"></p>
    <p v-html="$t('commGuidePara007')"></p>
    <p v-html="$t('commGuidePara008')"></p>
    <p v-html="$t('commGuidePara009')"></p>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/staff.png">
      <div class="media-body">
        <ul>
          <li>{{ $t('commGuideAKA', {habitName: 'Beffymaroo', realName: 'Beth'}) }}</li>
          <li>{{ $t('commGuideAKA', {habitName: 'Viirus', realName: 'Phillip'}) }}</li>
          <li>
            {{ $t('commGuideAKA', {
              habitName: 'redphoenix', realName: 'Vicky'}) }} ({{ $t('commGuideOnTrello', {
              trelloName: 'caffeinatedvee'}) }}, {{ $t('commGuideOnGitHub', {
              gitHubName: 'veeeeeee'}) }})
          </li>
          <li>
            {{ $t('commGuideAKA', {
              habitName: 'Lemoness', realName: 'Leslie'}) }} ({{ $t('commGuideOnTrello', {
              trelloName: 'lemonesstree'}) }})
          </li>
          <li>{{ $t('commGuideAKA', {habitName: 'SabreCat', realName: 'Sabe'}) }}</li>
          <li>{{ $t('commGuideAKA', {habitName: 'paglias', realName: 'Matteo'}) }}</li>
          <li>{{ $t('commGuideAKA', {habitName: 'TheHollidayInn', realName: 'Keith'}) }}</li>
        </ul>
      </div>
    </div>
    <p v-html="$t('commGuidePara010')"></p>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/moderators.png">
      <div class="media-body">
        <p v-html="$t('commGuidePara011')"></p>
        <ul>
          <li>Bailey (It's Bailey {{ $t('commGuidePara011a') }})</li>
          <li>Ryan (deilann {{ $t('commGuidePara011b') }})</li>
          <li>Cantras</li>
          <li>Alys (LadyAlys {{ $t('commGuidePara011c') }})</li>
          <li>Fox_town</li>
          <li>Blade ({{ $t('commGuideOnGitHub', {gitHubName: 'crookedneighbor'}) }})</li>
          <li>Daniel the Bard</li>
          <li>shanaqui</li>
          <li>Dewines</li>
          <li>Megan</li>
          <li>Breadstrings</li>
        </ul>
      </div>
    </div>
    <p v-html="$t('commGuidePara012')"></p>
    <p v-html="$t('commGuidePara013')"></p>
    <p>
      {{ $t('commGuidePara014') }}&nbsp;
      <em>lefnire, Slappybag, litenull, Shaner, Bobbyroberts99, wc8</em>
    </p>
    <h2 id="final">
      {{ $t('commGuideHeadingFinal') }}
    </h2>
    <p v-html="$t('commGuidePara067')"></p>
    <p v-html="$t('commGuidePara068')"></p>
    <h2 id="links">
      {{ $t('commGuideHeadingLinks') }}
    </h2>
    <ul>
      <li v-html="$t('commGuideLink01')"></li>
      <li v-html="$t('commGuideLink02')"></li>
      <li v-html="$t('commGuideLink03')"></li>
      <li v-html="$t('commGuideLink04')"></li>
      <li v-html="$t('commGuideLink05')"></li>
      <li v-html="$t('commGuideLink06')"></li>
      <li v-html="$t('commGuideLink07')"></li>
    </ul>
    <p v-html="$t('commGuidePara069')"></p>
    <ul class="list-2col list-unstyled">
      <li>Breadstrings</li>
      <li>Draayder</li>
      <li>Kiwibot</li>
      <li>Leephon</li>
      <li>Lemoness</li>
      <li>Luciferian</li>
      <li>Revcleo</li>
      <li>Shaner</li>
      <li>Starsystemic</li>
      <li>UncommonCriminal</li>
    </ul>
  </div>
</template>

<style lang='scss' scoped>
  .list-2col {
    width: 50%;
    columns: 2;
    -moz-columns: 2;
    -webkit-columns: 2;
  }
</style>
