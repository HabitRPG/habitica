<template>
  <div class="container-fluid w-75 mx-auto">
    <h1>{{ $t('communityGuidelines') }}</h1>
    <hr>
    <p>{{ $t('lastUpdated') }} June 8, 2023</p>
    <h2 id="welcome">
      {{ $t('commGuideHeadingWelcome') }}
    </h2>
    <img
      src="~@/assets/images/community-guidelines/intro.png"
      class="mb-3"
    >
    <p v-html="$t('commGuidePara001')"></p>
    <p v-html="$t('commGuidePara002')"></p>
    <p v-html="$t('commGuidePara003')"></p>
    <h2 id="interactions">
      {{ $t('commGuideHeadingInteractions') }}
    </h2>
    <p v-html="$t('commGuidePara015')"></p>
    <p v-html="$t('commGuidePara016')"></p>
    <div class="media align-items-center">
      <img src="~@/assets/images/community-guidelines/publicSpaces.png">
    </div>
    <ul>
      <li><strong>{{ $t('commGuideList01A') }}</strong></li>
      <li v-html="$t('commGuideList02C')"></li>
      <li v-html="$t('commGuideList02N')"></li>
      <li v-html="$t('commGuideList02H')"></li>
      <li v-html="$t('commGuideList02A')"></li>
      <li v-html="$t('commGuideList02I')"></li>
      <li v-html="$t('commGuideList02G')"></li>
      <li v-html="$t('commGuideList02D')"></li>
      <li v-html="$t('commGuideList02E')"></li>
      <li v-html="$t('commGuideList02O')"></li>
      <li v-html="$t('commGuidePara037')"></li>
      <li v-html="$t('commGuideList02P')"></li>
      <li v-html="$t('commGuideList02Q')"></li>
      <li v-html="$t('commGuideList02M')"></li>
      <li v-html="$t('commGuideList02L')"></li>
      <li v-html="$t('commGuideList02J')"></li>
      <li v-html="$t('commGuideList02K')"></li>
    </ul>
    <h2 id="infractions-consequences-restoration">
      {{ $t('commGuideHeadingInfractionsEtc') }}
    </h2>
    <h3 id="infractions">
      {{ $t('commGuideHeadingInfractions') }}
    </h3>
    <img
      src="~@/assets/images/community-guidelines/infractions.png"
      class="mb-3"
    >
    <p v-html="$t('commGuidePara050')"></p>
    <p v-html="$t('commGuidePara051')"></p>
    <h4>{{ $t('commGuideHeadingSevereInfractions') }}</h4>
    <p v-html="$t('commGuidePara052')"></p>
    <p v-html="$t('commGuidePara053')"></p>
    <ul>
      <li v-html="$t('commGuideList05B')"></li>
      <li v-html="$t('commGuideList05C')"></li>
      <li v-html="$t('commGuideList05D')"></li>
      <li v-html="$t('commGuideList05E')"></li>
      <li v-html="$t('commGuideList05F')"></li>
      <li v-html="$t('commGuideList05G')"></li>
      <li v-html="$t('commGuideList05H')"></li>
      <li v-html="$t('commGuideList05A')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingModerateInfractions') }}</h4>
    <p v-html="$t('commGuidePara054')"></p>
    <p v-html="$t('commGuidePara055')"></p>
    <ul>
      <li v-html="$t('commGuideList06A')"></li>
      <li v-html="$t('commGuideList06C')"></li>
      <li v-html="$t('commGuideList06E')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingMinorInfractions') }}</h4>
    <p v-html="$t('commGuidePara056')"></p>
    <h3 id="consequences">
      {{ $t('commGuideHeadingConsequences') }}
    </h3>
    <p v-html="$t('commGuidePara059')"></p>
    <img src="~@/assets/images/community-guidelines/consequences.png">
    <h4>{{ $t('commGuideHeadingSevereConsequences') }}</h4>
    <ul>
      <li v-html="$t('commGuideList09A')"></li>
      <li v-html="$t('commGuideList09C')"></li>
      <li v-html="$t('commGuideList09D')"></li>
      <li v-html="$t('commGuideList09E')"></li>
    </ul>
    <h4>{{ $t('commGuideHeadingModerateConsequences') }}</h4>
    <ul>
      <li v-html="$t('commGuideList10D')"></li>
      <li v-html="$t('commGuideList10G')"></li>
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
    <img
      src="~@/assets/images/community-guidelines/restoration.png"
      class="mb-3"
    >
    <p v-html="$t('commGuidePara061')"></p>
    <p v-html="$t('commGuidePara063')"></p>
    <h2 id="meet-the-mods">
      {{ $t('commGuideHeadingMeet') }}
    </h2>
    <p v-html="$t('commGuidePara007')"></p>
    <p v-html="$t('commGuidePara009')"></p>
    <img
      src="~@/assets/images/community-guidelines/staff.png"
      class="mb-3"
    >
    <ul>
      <li>
        {{ $t('commGuideAKA', {habitName: 'heyeilatan', realName: 'Natalie'}) }}
        ({{ $t('commGuideOnGitHub', {gitHubName: 'CuriousMagpie'}) }})
        - Web Developer
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'redphoenix', realName: 'Vicky'}) }}
        ({{ $t('commGuideOnGitHub', {gitHubName: 'veeeeeee'}) }})
        - Co-Founder
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'Beffymaroo', realName: 'Beth'}) }}
        - Art, Community Management, Many Hats
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'SabreCat', realName: 'Sabe'}) }}
        - Web Developer
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'Apollo', realName: 'Tressley'}) }}
        - Designer
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'Piyo', realName: 'Sara'}) }}
        - Mobile Designer
      </li>
      <li>
        {{ $t('commGuideAKA', {habitName: 'Viirus', realName: 'Phillip'}) }}
        - Mobile Developer
      </li>
    </ul>
    <p v-html="$t('commGuidePara013')"></p>
    <p>
      {{ $t('commGuidePara014') }}<br>
      <em>
        Lemoness, lefnire, Slappybag, litenull, Shaner, Bobbyroberts99, wc8,
        Breadstrings, Megan, Blade, Daniel the Bard, deilann, shanaqui, Nakonana,
        Dewines, Alys, Fox_town, MaybeSteveRogers, and Cantras.
      </em>
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
      <li><a href="/static/faq">{{ $t('faq') }}</a></li>
      <li v-html="$t('commGuideLink03')"></li>
      <li v-html="$t('commGuideLink04')"></li>
    </ul>
    <p v-html="$t('commGuidePara069')"></p>
    <ul>
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
