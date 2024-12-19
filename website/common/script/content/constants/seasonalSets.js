const SEASONAL_SETS = {
  winter: [
    // winter 2014
    'candycaneSet',
    'skiSet',
    'snowflakeSet',
    'yetiSet',

    // winter 2015
    'northMageSet',
    'icicleDrakeSet',
    'soothingSkaterSet',
    'gingerbreadSet',

    // winter 2016
    'snowDaySet',
    'snowboardingSet',
    'festiveFairySet',
    'cocoaSet',

    'winter2017IceHockeySet',
    'winter2017WinterWolfSet',
    'winter2017SugarPlumSet',
    'winter2017FrostyRogueSet',

    'winter2018ConfettiSet',
    'winter2018GiftWrappedSet',
    'winter2018MistletoeSet',
    'winter2018ReindeerSet',

    'winter2019PoinsettiaSet',
    'winter2019WinterStarSet',
    'winter2019BlizzardSet',
    'winter2019PyrotechnicSet',

    'winter2020CarolOfTheMageSet',
    'winter2020LanternSet',
    'winter2020EvergreenSet',
    'winter2020WinterSpiceSet',

    'winter2021WinterMoonMageSet',
    'winter2021HollyIvyRogueSet',
    'winter2021IceFishingWarriorSet',
    'winter2021ArcticExplorerHealerSet',

    'winter2022FireworksRogueSet',
    'winter2022StockingWarriorSet',
    'winter2022PomegranateMageSet',
    'winter2022IceCrystalHealerSet',

    'winter2023RibbonRogueSet',
    'winter2023WalrusWarriorSet',
    'winter2023FairyLightsMageSet',
    'winter2023CardinalHealerSet',

    'winter2024SnowyOwlRogueSet',
    'winter2024PeppermintBarkWarriorSet',
    'winter2024NarwhalWizardMageSet',
    'winter2024FrozenHealerSet',

    'winter2025MooseWarriorSet',
    'winter2025AuroraMageSet',
    'winter2025StringLightsHealerSet',
    'winter2025SnowRogueSet',
  ],
  spring: [
    // spring 2014
    'mightyBunnySet',
    'magicMouseSet',
    'lovingPupSet',
    'stealthyKittySet',

    // spring 2015
    'bewareDogSet',
    'magicianBunnySet',
    'comfortingKittySet',
    'sneakySqueakerSet',

    // spring 2016
    'springingBunnySet',
    'grandMalkinSet',
    'cleverDogSet',
    'braveMouseSet',

    'spring2017FelineWarriorSet',
    'spring2017CanineConjurorSet',
    'spring2017FloralMouseSet',
    'spring2017SneakyBunnySet',

    'spring2018TulipMageSet',
    'spring2018SunriseWarriorSet',
    'spring2018DucklingRogueSet',
    'spring2018GarnetHealerSet',

    'spring2019AmberMageSet',
    'spring2019OrchidWarriorSet',
    'spring2019CloudRogueSet',
    'spring2019RobinHealerSet',

    'spring2020BeetleWarriorSet',
    'spring2020IrisHealerSet',
    'spring2020LapisLazuliRogueSet',
    'spring2020PuddleMageSet',

    'spring2021SwanMageSet',
    'spring2021WillowHealerSet',
    'spring2021SunstoneWarriorSet',
    'spring2021TwinFlowerRogueSet',

    'spring2022ForsythiaMageSet',
    'spring2022PeridotHealerSet',
    'spring2022RainstormWarriorSet',
    'spring2022MagpieRogueSet',

    'spring2023CaterpillarRogueSet',
    'spring2023HummingbirdWarriorSet',
    'spring2023MoonstoneMageSet',
    'spring2023LilyHealerSet',

    'spring2024FluoriteWarriorSet',
    'spring2024HibiscusMageSet',
    'spring2024BluebirdHealerSet',
    'spring2024MeltingSnowRogueSet',
  ],

  summer: [
    // summer 2014
    'daringSwashbucklerSet',
    'emeraldMermageSet',
    'reefSeahealerSet',
    'roguishPirateSet',

    // summer 2015
    'sunfishWarriorSet',
    'shipSoothsayerSet',
    'strappingSailorSet',
    'reefRenegadeSet',

    'summer2016SharkWarriorSet',
    'summer2016DolphinMageSet',
    'summer2016SeahorseHealerSet',
    'summer2016EelSet',

    'summer2017SandcastleWarriorSet',
    'summer2017WhirlpoolMageSet',
    'summer2017SeashellSeahealerSet',
    'summer2017SeaDragonSet',

    'summer2018BettaFishWarriorSet',
    'summer2018LionfishMageSet',
    'summer2018MerfolkMonarchSet',
    'summer2018FisherRogueSet',

    'summer2019SeaTurtleWarriorSet',
    'summer2019WaterLilyMageSet',
    'summer2019ConchHealerSet',
    'summer2019HammerheadRogueSet',

    'summer2020SeaGlassHealerSet',
    'summer2020OarfishMageSet',
    'summer2020CrocodileRogueSet',
    'summer2020RainbowTroutWarriorSet',

    'summer2021ParrotHealerSet',
    'summer2021ClownfishRogueSet',
    'summer2021FlyingFishWarriorSet',
    'summer2021NautilusMageSet',

    'summer2022CrabRogueSet',
    'summer2022WaterspoutWarriorSet',
    'summer2022MantaRayMageSet',
    'summer2022AngelfishHealerSet',

    'summer2023GoldfishWarriorSet',
    'summer2023CoralMageSet',
    'summer2023GuppyRogueSet',
    'summer2023KelpHealerSet',

    'summer2024WhaleSharkWarriorSet',
    'summer2024SeaAnemoneMageSet',
    'summer2024SeaSnailHealerSet',
    'summer2024NudibranchRogueSet',
  ],
  fall: [
    // fall 2014
    'vampireSmiterSet',
    'monsterOfScienceSet',
    'witchyWizardSet',
    'mummyMedicSet',

    // fall 2015
    'battleRogueSet',
    'scarecrowWarriorSet',
    'stitchWitchSet',
    'potionerSet',

    'fall2016BlackWidowSet',
    'fall2016SwampThingSet',
    'fall2016WickedSorcererSet',
    'fall2016GorgonHealerSet',

    'fall2017TrickOrTreatSet',
    'fall2017HabitoweenSet',
    'fall2017MasqueradeSet',
    'fall2017HauntedHouseSet',

    'fall2018MinotaurWarriorSet',
    'fall2018CandymancerMageSet',
    'fall2018CarnivorousPlantSet',
    'fall2018AlterEgoSet',

    'fall2019CyclopsSet',
    'fall2019LichSet',
    'fall2019OperaticSpecterSet',
    'fall2019RavenSet',

    'fall2020TwoHeadedRogueSet',
    'fall2020WraithWarriorSet',
    'fall2020ThirdEyeMageSet',
    'fall2020DeathsHeadMothHealerSet',

    'fall2021OozeRogueSet',
    'fall2021HeadlessWarriorSet',
    'fall2021BrainEaterMageSet',
    'fall2021FlameSummonerHealerSet',

    'fall2022KappaRogueSet',
    'fall2022OrcWarriorSet',
    'fall2022HarpyMageSet',
    'fall2022WatcherHealerSet',

    'fall2023WitchsBrewRogueSet',
    'fall2023BogCreatureHealerSet',
    'fall2023ScaryMovieWarriorSet',
    'fall2023ScarletWarlockMageSet',

    'fall2024FieryImpWarriorSet',
    'fall2024UnderworldSorcerorMageSet',
    'fall2024SpaceInvaderHealerSet',
    'fall2024BlackCatRogueSet',
  ],
};

export default SEASONAL_SETS;
