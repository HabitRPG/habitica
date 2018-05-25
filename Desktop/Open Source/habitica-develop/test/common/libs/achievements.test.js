import shared from '../../../website/common';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('achievements', () => {
  describe('general well-formedness', () => {
    let user = generateUser();
    let achievements = shared.achievements.getAchievementsForProfile(user);

    it('each category has \'label\' and \'achievements\' fields', () => {
      _.each(achievements, (category) => {
        expect(category).to.have.property('label')
          .that.is.a('string');
        expect(category).to.have.property('achievements')
          .that.is.a('object');
      });
    });

    it('each achievement has all required fields of correct types', () => {
      _.each(achievements, (category) => {
        _.each(category.achievements, (achiev) => {
          // May have additional fields (such as 'value' and 'optionalCount').
          expect(achiev).to.contain.all.keys(['title', 'text', 'icon', 'earned', 'index']);
          expect(achiev.title).to.be.a('string');
          expect(achiev.text).to.be.a('string');
          expect(achiev.icon).to.be.a('string');
          expect(achiev.earned).to.be.a('boolean');
          expect(achiev.index).to.be.a('number');
        });
      });
    });

    it('categories have unique labels', () => {
      let achievementsArray = _.values(achievements).map(cat => cat.label);
      let labels = _.uniq(achievementsArray);

      expect(labels.length).to.be.greaterThan(0);
      expect(labels.length).to.eql(_.size(achievements));
    });

    it('achievements have unique keys', () => {
      let keysSoFar = {};

      _.each(achievements, (category) => {
        _.keys(category.achievements).forEach((key) => {
          expect(keysSoFar[key]).to.be.undefined;
          keysSoFar[key] = key;
        });
      });
    });

    it('achievements have unique indices', () => {
      let indicesSoFar = {};

      _.each(achievements, (category) => {
        _.each(category.achievements, (achiev) => {
          let i = achiev.index;
          expect(indicesSoFar[i]).to.be.undefined;
          indicesSoFar[i] = i;
        });
      });
    });

    it('all categories have at least 1 achievement', () => {
      _.each(achievements, (category) => {
        expect(_.size(category.achievements)).to.be.greaterThan(0);
      });
    });
  });

  describe('unearned basic achievements', () => {
    let user = generateUser();
    let basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

    it('streak and perfect day achievements exist with counts', () => {
      let streak = basicAchievs.streak;
      let perfect = basicAchievs.perfect;

      expect(streak).to.exist;
      expect(streak).to.have.property('optionalCount')
        .that.is.a('number');
      expect(perfect).to.exist;
      expect(perfect).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('party up/on achievements exist with no counts', () => {
      let partyUp = basicAchievs.partyUp;
      let partyOn = basicAchievs.partyOn;

      expect(partyUp).to.exist;
      expect(partyUp.optionalCount).to.be.undefined;
      expect(partyOn).to.exist;
      expect(partyOn.optionalCount).to.be.undefined;
    });

    it('pet/mount master and triad bingo achievements exist with counts', () => {
      let beastMaster = basicAchievs.beastMaster;
      let mountMaster = basicAchievs.mountMaster;
      let triadBingo = basicAchievs.triadBingo;

      expect(beastMaster).to.exist;
      expect(beastMaster).to.have.property('optionalCount')
        .that.is.a('number');
      expect(mountMaster).to.exist;
      expect(mountMaster).to.have.property('optionalCount')
        .that.is.a('number');
      expect(triadBingo).to.exist;
      expect(triadBingo).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('ultimate gear achievements exist with no counts', () => {
      let gearTypes = ['healer', 'rogue', 'warrior', 'mage'];
      gearTypes.forEach((gear) => {
        let gearAchiev = basicAchievs[`${gear}UltimateGear`];

        expect(gearAchiev).to.exist;
        expect(gearAchiev.optionalCount).to.be.undefined;
      });
    });

    it('card achievements exist with counts', () => {
      let cardTypes = ['greeting', 'thankyou', 'birthday', 'congrats', 'getwell', 'goodluck'];
      cardTypes.forEach((card) => {
        let cardAchiev = basicAchievs[`${card}Cards`];

        expect(cardAchiev).to.exist;
        expect(cardAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });

    it('rebirth achievement exists with no count', () => {
      let rebirth = basicAchievs.rebirth;

      expect(rebirth).to.exist;
      expect(rebirth.optionalCount).to.be.undefined;
    });
  });

  describe('unearned seasonal achievements', () => {
    let user = generateUser();
    let seasonalAchievs = shared.achievements.getAchievementsForProfile(user).seasonal.achievements;

    it('habiticaDays and habitBirthdays achievements exist with counts', () => {
      let habiticaDays = seasonalAchievs.habiticaDays;
      let habitBirthdays = seasonalAchievs.habitBirthdays;

      expect(habiticaDays).to.exist;
      expect(habiticaDays).to.have.property('optionalCount')
        .that.is.a('number');
      expect(habitBirthdays).to.exist;
      expect(habitBirthdays).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('spell achievements exist with counts', () => {
      let spellTypes = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];
      spellTypes.forEach((spell) => {
        let spellAchiev = seasonalAchievs[spell];

        expect(spellAchiev).to.exist;
        expect(spellAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });

    it('quest achievements do not exist', () => {
      let quests = ['dilatory', 'stressbeast', 'burnout', 'bewilder'];
      quests.forEach((quest) => {
        let questAchiev = seasonalAchievs[`${quest}Quest`];

        expect(questAchiev).to.not.exist;
      });
    });

    it('costumeContests achievement exists with count', () => {
      let costumeContests = seasonalAchievs.costumeContests;

      expect(costumeContests).to.exist;
      expect(costumeContests).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('card achievements exist with counts', () => {
      let cardTypes = ['nye', 'valentine'];
      cardTypes.forEach((card) => {
        let cardAchiev = seasonalAchievs[`${card}Cards`];

        expect(cardAchiev).to.exist;
        expect(cardAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });
  });

  describe('unearned special achievements', () => {
    let user = generateUser();
    let specialAchievs = shared.achievements.getAchievementsForProfile(user).special.achievements;

    it('habitSurveys achievement exists with count', () => {
      let habitSurveys = specialAchievs.habitSurveys;

      expect(habitSurveys).to.exist;
      expect(habitSurveys).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('contributor achievement exists with value and no count', () => {
      let contributor = specialAchievs.contributor;

      expect(contributor).to.exist;
      expect(contributor).to.have.property('value')
        .that.is.a('number');
      expect(contributor.optionalCount).to.be.undefined;
    });

    it('npc achievement is hidden if unachieved', () => {
      let npc = specialAchievs.npc;
      expect(npc).to.not.exist;
    });

    it('kickstarter achievement is hidden if unachieved', () => {
      let kickstarter = specialAchievs.kickstarter;
      expect(kickstarter).to.not.exist;
    });

    it('veteran achievement is hidden if unachieved', () => {
      let veteran = specialAchievs.veteran;
      expect(veteran).to.not.exist;
    });

    it('originalUser achievement is hidden if unachieved', () => {
      let originalUser = specialAchievs.originalUser;
      expect(originalUser).to.not.exist;
    });
  });

  describe('earned seasonal achievements', () => {
    let user = generateUser();
    let quests = ['dilatory', 'stressbeast', 'burnout', 'bewilder'];
    quests.forEach((quest) => {
      user.achievements.quests[quest] = 1;
    });
    let seasonalAchievs = shared.achievements.getAchievementsForProfile(user).seasonal.achievements;

    it('quest achievements exist', () => {
      quests.forEach((quest) => {
        let questAchiev = seasonalAchievs[`${quest}Quest`];

        expect(questAchiev).to.exist;
        expect(questAchiev.optionalCount).to.be.undefined;
      });
    });
  });

  describe('earned special achievements', () => {
    let user = generateUser({
      achievements: {
        habitSurveys: 2,
        veteran: true,
        originalUser: true,
      },
      backer: {tier: 3},
      contributor: {level: 1},
    });
    let specialAchievs = shared.achievements.getAchievementsForProfile(user).special.achievements;

    it('habitSurveys achievement is earned with correct value', () => {
      let habitSurveys = specialAchievs.habitSurveys;

      expect(habitSurveys).to.exist;
      expect(habitSurveys.earned).to.eql(true);
      expect(habitSurveys.value).to.eql(2);
    });

    it('contributor achievement is earned with correct value', () => {
      let contributor = specialAchievs.contributor;

      expect(contributor).to.exist;
      expect(contributor.earned).to.eql(true);
      expect(contributor.value).to.eql(1);
    });

    it('npc achievement is earned with correct value', () => {
      let npcUser = generateUser({
        backer: {npc: 'test'},
      });
      let npc = shared.achievements.getAchievementsForProfile(npcUser).special.achievements.npc;

      expect(npc).to.exist;
      expect(npc.earned).to.eql(true);
      expect(npc.value).to.eql('test');
    });

    it('kickstarter achievement is earned with correct value', () => {
      let kickstarter = specialAchievs.kickstarter;

      expect(kickstarter).to.exist;
      expect(kickstarter.earned).to.eql(true);
      expect(kickstarter.value).to.eql(3);
    });

    it('veteran achievement is earned', () => {
      let veteran = specialAchievs.veteran;

      expect(veteran).to.exist;
      expect(veteran.earned).to.eql(true);
    });

    it('originalUser achievement is earned', () => {
      let originalUser = specialAchievs.originalUser;

      expect(originalUser).to.exist;
      expect(originalUser.earned).to.eql(true);
    });
  });

  describe('mountMaster, beastMaster, and triadBingo achievements', () => {
    it('master and triad bingo achievements do not include *Text2 strings if no keys have been used', () => {
      let user = generateUser();
      let basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

      let beastMaster = basicAchievs.beastMaster;
      let mountMaster = basicAchievs.mountMaster;
      let triadBingo = basicAchievs.triadBingo;

      expect(beastMaster.text).to.not.match(/released/);
      expect(beastMaster.text).to.not.match(/0 time\(s\)/);
      expect(mountMaster.text).to.not.match(/released/);
      expect(mountMaster.text).to.not.match(/0 time\(s\)/);
      expect(triadBingo.text).to.not.match(/released/);
      expect(triadBingo.text).to.not.match(/0 time\(s\)/);
    });

    it('master and triad bingo achievements includes *Text2 strings if keys have been used', () => {
      let user = generateUser({
        achievements: {
          beastMasterCount: 1,
          mountMasterCount: 2,
          triadBingoCount: 3,
        },
      });
      let basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

      let beastMaster = basicAchievs.beastMaster;
      let mountMaster = basicAchievs.mountMaster;
      let triadBingo = basicAchievs.triadBingo;

      expect(beastMaster.text).to.match(/released/);
      expect(beastMaster.text).to.match(/1 time\(s\)/);
      expect(mountMaster.text).to.match(/released/);
      expect(mountMaster.text).to.match(/2 time\(s\)/);
      expect(triadBingo.text).to.match(/released/);
      expect(triadBingo.text).to.match(/3 time\(s\)/);
    });
  });

  describe('ultimateGear achievements', () => {
    it('title and text contain localized class info', () => {
      let user = generateUser();
      let basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;
      let gearTypes = ['healer', 'rogue', 'warrior', 'mage'];

      gearTypes.forEach((gear) => {
        let gearAchiev = basicAchievs[`${gear}UltimateGear`];
        let classNameRegex = new RegExp(gear.charAt(0).toUpperCase() + gear.slice(1));

        expect(gearAchiev.title).to.match(classNameRegex);
        expect(gearAchiev.text).to.match(classNameRegex);
      });
    });
  });
});
