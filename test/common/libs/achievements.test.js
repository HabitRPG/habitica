import shared from '../../../website/common';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('achievements', () => {
  describe('general well-formedness', () => {
    const user = generateUser();
    const achievements = shared.achievements.getAchievementsForProfile(user);

    it('each category has \'label\' and \'achievements\' fields', () => {
      _.each(achievements, category => {
        expect(category).to.have.property('label')
          .that.is.a('string');
        expect(category).to.have.property('achievements')
          .that.is.a('object');
      });
    });

    it('each achievement has all required fields of correct types', () => {
      _.each(achievements, category => {
        _.each(category.achievements, achiev => {
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
      const achievementsArray = _.values(achievements).map(cat => cat.label);
      const labels = _.uniq(achievementsArray);

      expect(labels.length).to.be.greaterThan(0);
      expect(labels.length).to.eql(_.size(achievements));
    });

    it('achievements have unique keys', () => {
      const keysSoFar = {};

      _.each(achievements, category => {
        _.keys(category.achievements).forEach(key => {
          expect(keysSoFar[key]).to.be.undefined;
          keysSoFar[key] = key;
        });
      });
    });

    it('achievements have unique indices', () => {
      const indicesSoFar = {};

      _.each(achievements, category => {
        _.each(category.achievements, achiev => {
          const i = achiev.index;
          expect(indicesSoFar[i]).to.be.undefined;
          indicesSoFar[i] = i;
        });
      });
    });

    it('all categories have at least 1 achievement', () => {
      _.each(achievements, category => {
        expect(_.size(category.achievements)).to.be.greaterThan(0);
      });
    });
  });

  describe('unearned basic achievements', () => {
    const user = generateUser();
    const basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

    it('streak and perfect day achievements exist with counts', () => {
      const { streak } = basicAchievs;
      const { perfect } = basicAchievs;

      expect(streak).to.exist;
      expect(streak).to.have.property('optionalCount')
        .that.is.a('number');
      expect(perfect).to.exist;
      expect(perfect).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('party up/on achievements exist with no counts', () => {
      const { partyUp } = basicAchievs;
      const { partyOn } = basicAchievs;

      expect(partyUp).to.exist;
      expect(partyUp.optionalCount).to.be.undefined;
      expect(partyOn).to.exist;
      expect(partyOn.optionalCount).to.be.undefined;
    });

    it('pet/mount master and triad bingo achievements exist with counts', () => {
      const { beastMaster } = basicAchievs;
      const { mountMaster } = basicAchievs;
      const { triadBingo } = basicAchievs;

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
      const gearTypes = ['healer', 'rogue', 'warrior', 'mage'];
      gearTypes.forEach(gear => {
        const gearAchiev = basicAchievs[`${gear}UltimateGear`];

        expect(gearAchiev).to.exist;
        expect(gearAchiev.optionalCount).to.be.undefined;
      });
    });

    it('card achievements exist with counts', () => {
      const cardTypes = ['greeting', 'thankyou', 'birthday', 'congrats', 'getwell', 'goodluck'];
      cardTypes.forEach(card => {
        const cardAchiev = basicAchievs[`${card}Cards`];

        expect(cardAchiev).to.exist;
        expect(cardAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });

    it('rebirth achievement exists with no count', () => {
      const { rebirth } = basicAchievs;

      expect(rebirth).to.exist;
      expect(rebirth.optionalCount).to.be.undefined;
    });
  });

  describe('unearned seasonal achievements', () => {
    const user = generateUser();
    const userAchievements = shared.achievements.getAchievementsForProfile(user);
    const seasonalAchievs = userAchievements.seasonal.achievements;

    it('habiticaDays and habitBirthdays achievements exist with counts', () => {
      const { habiticaDays } = seasonalAchievs;
      const { habitBirthdays } = seasonalAchievs;

      expect(habiticaDays).to.exist;
      expect(habiticaDays).to.have.property('optionalCount')
        .that.is.a('number');
      expect(habitBirthdays).to.exist;
      expect(habitBirthdays).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('spell achievements exist with counts', () => {
      const spellTypes = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];
      spellTypes.forEach(spell => {
        const spellAchiev = seasonalAchievs[spell];

        expect(spellAchiev).to.exist;
        expect(spellAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });

    it('quest achievements do not exist', () => {
      const quests = ['dilatory', 'stressbeast', 'burnout', 'bewilder'];
      quests.forEach(quest => {
        const questAchiev = seasonalAchievs[`${quest}Quest`];

        expect(questAchiev).to.not.exist;
      });
    });

    it('costumeContests achievement exists with count', () => {
      const { costumeContests } = seasonalAchievs;

      expect(costumeContests).to.exist;
      expect(costumeContests).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('card achievements exist with counts', () => {
      const cardTypes = ['nye', 'valentine'];
      cardTypes.forEach(card => {
        const cardAchiev = seasonalAchievs[`${card}Cards`];

        expect(cardAchiev).to.exist;
        expect(cardAchiev).to.have.property('optionalCount')
          .that.is.a('number');
      });
    });
  });

  describe('unearned special achievements', () => {
    const user = generateUser();
    const specialAchievs = shared.achievements.getAchievementsForProfile(user).special.achievements;

    it('habitSurveys achievement exists with count', () => {
      const { habitSurveys } = specialAchievs;

      expect(habitSurveys).to.exist;
      expect(habitSurveys).to.have.property('optionalCount')
        .that.is.a('number');
    });

    it('contributor achievement exists with value and no count', () => {
      const { contributor } = specialAchievs;

      expect(contributor).to.exist;
      expect(contributor).to.have.property('value')
        .that.is.a('number');
      expect(contributor.optionalCount).to.be.undefined;
    });

    it('npc achievement is hidden if unachieved', () => {
      const { npc } = specialAchievs;
      expect(npc).to.not.exist;
    });

    it('kickstarter achievement is hidden if unachieved', () => {
      const { kickstarter } = specialAchievs;
      expect(kickstarter).to.not.exist;
    });

    it('veteran achievement is hidden if unachieved', () => {
      const { veteran } = specialAchievs;
      expect(veteran).to.not.exist;
    });

    it('originalUser achievement is hidden if unachieved', () => {
      const { originalUser } = specialAchievs;
      expect(originalUser).to.not.exist;
    });
  });

  describe('unearned onboarding achievements', () => {
    const user = generateUser();
    const onboardingAchievs = shared
      .achievements.getAchievementsForProfile(user).onboarding.achievements;

    it('created task achievement exists with no count', () => {
      const { createdTask } = onboardingAchievs;

      expect(createdTask).to.exist;
      expect(createdTask.optionalCount).to.be.undefined;
    });

    it('completed task achievement exists with no count', () => {
      const { completedTask } = onboardingAchievs;

      expect(completedTask).to.exist;
      expect(completedTask.optionalCount).to.be.undefined;
    });

    it('hatched pet achievement exists with no count', () => {
      const { hatchedPet } = onboardingAchievs;

      expect(hatchedPet).to.exist;
      expect(hatchedPet.optionalCount).to.be.undefined;
    });

    it('fed pet achievement exists with no count', () => {
      const { fedPet } = onboardingAchievs;

      expect(fedPet).to.exist;
      expect(fedPet.optionalCount).to.be.undefined;
    });

    it('purchased equipment achievement exists with no count', () => {
      const { purchasedEquipment } = onboardingAchievs;

      expect(purchasedEquipment).to.exist;
      expect(purchasedEquipment.optionalCount).to.be.undefined;
    });
  });

  describe('earned seasonal achievements', () => {
    const user = generateUser();
    const quests = ['dilatory', 'stressbeast', 'burnout', 'bewilder'];
    quests.forEach(quest => {
      user.achievements.quests[quest] = 1;
    });
    const userAchievements = shared.achievements.getAchievementsForProfile(user);
    const seasonalAchievs = userAchievements.seasonal.achievements;

    it('quest achievements exist', () => {
      quests.forEach(quest => {
        const questAchiev = seasonalAchievs[`${quest}Quest`];

        expect(questAchiev).to.exist;
        expect(questAchiev.optionalCount).to.be.undefined;
      });
    });
  });

  describe('earned special achievements', () => {
    const user = generateUser({
      achievements: {
        habitSurveys: 2,
        veteran: true,
        originalUser: true,
      },
      backer: { tier: 3 },
      contributor: { level: 1 },
    });
    const specialAchievs = shared.achievements.getAchievementsForProfile(user).special.achievements;

    it('habitSurveys achievement is earned with correct value', () => {
      const { habitSurveys } = specialAchievs;

      expect(habitSurveys).to.exist;
      expect(habitSurveys.earned).to.eql(true);
      expect(habitSurveys.value).to.eql(2);
    });

    it('contributor achievement is earned with correct value', () => {
      const { contributor } = specialAchievs;

      expect(contributor).to.exist;
      expect(contributor.earned).to.eql(true);
      expect(contributor.value).to.eql(1);
    });

    it('npc achievement is earned with correct value', () => {
      const npcUser = generateUser({
        backer: { npc: 'test' },
      });
      const { npc } = shared.achievements.getAchievementsForProfile(npcUser).special.achievements;

      expect(npc).to.exist;
      expect(npc.earned).to.eql(true);
      expect(npc.value).to.eql('test');
    });

    it('kickstarter achievement is earned with correct value', () => {
      const { kickstarter } = specialAchievs;

      expect(kickstarter).to.exist;
      expect(kickstarter.earned).to.eql(true);
      expect(kickstarter.value).to.eql(3);
    });

    it('veteran achievement is earned', () => {
      const { veteran } = specialAchievs;

      expect(veteran).to.exist;
      expect(veteran.earned).to.eql(true);
    });

    it('originalUser achievement is earned', () => {
      const { originalUser } = specialAchievs;

      expect(originalUser).to.exist;
      expect(originalUser.earned).to.eql(true);
    });
  });

  describe('mountMaster, beastMaster, and triadBingo achievements', () => {
    it('master and triad bingo achievements do not include *Text2 strings if no keys have been used', () => {
      const user = generateUser();
      const basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

      const { beastMaster } = basicAchievs;
      const { mountMaster } = basicAchievs;
      const { triadBingo } = basicAchievs;

      expect(beastMaster.text).to.not.match(/released/);
      expect(beastMaster.text).to.not.match(/0 time\(s\)/);
      expect(mountMaster.text).to.not.match(/released/);
      expect(mountMaster.text).to.not.match(/0 time\(s\)/);
      expect(triadBingo.text).to.not.match(/released/);
      expect(triadBingo.text).to.not.match(/0 time\(s\)/);
    });

    it('master and triad bingo achievements includes *Text2 strings if keys have been used', () => {
      const user = generateUser({
        achievements: {
          beastMasterCount: 1,
          mountMasterCount: 2,
          triadBingoCount: 3,
        },
      });
      const basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;

      const { beastMaster } = basicAchievs;
      const { mountMaster } = basicAchievs;
      const { triadBingo } = basicAchievs;

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
      const user = generateUser();
      const basicAchievs = shared.achievements.getAchievementsForProfile(user).basic.achievements;
      const gearTypes = ['healer', 'rogue', 'warrior', 'mage'];

      gearTypes.forEach(gear => {
        const gearAchiev = basicAchievs[`${gear}UltimateGear`];
        const classNameRegex = new RegExp(gear.charAt(0).toUpperCase() + gear.slice(1));

        expect(gearAchiev.title).to.match(classNameRegex);
        expect(gearAchiev.text).to.match(classNameRegex);
      });
    });
  });
});
