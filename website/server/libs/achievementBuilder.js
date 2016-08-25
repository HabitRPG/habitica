'use strict';

function contribText (contrib, backer, res) {
  if (!contrib && !backer) return;
  if (backer && backer.npc) return backer.npc;
  let lvl = contrib && contrib.level;
  if (lvl && lvl > 0) {
    let contribTitle = '';

    if (lvl < 3) {
      contribTitle = res.t('friend');
    } else if (lvl < 5) {
      contribTitle = res.t('elite');
    } else if (lvl < 7) {
      contribTitle = res.t('champion');
    } else if (lvl < 8) {
      contribTitle = res.t('legendary');
    } else if (lvl < 9) {
      contribTitle = res.t('guardian');
    } else {
      contribTitle = res.t('heroic');
    }

    return contribTitle + ' ' + contrib.text;
  }
}

class AchievementBuilder {
  constructor (res, memberObj) {
    this.res = res;
    this.member = memberObj;

    this._count = 0;
    this.result = {};
  }

  _add (data) {
    this.result[data.key] = {
      type: data.type,
      title: data.title,
      text: data.text,
      icon: data.icon,
      category: data.category,
      key: data.key,
      value: data.value,
      earned: data.earned,
      index: this._count++,
    };
  }

  _addQuest (data) {
    let value;

    if (this.member.achievements.quests) {
      value = this.member.achievements.quests[data.key];
    }

    let isEarned = Boolean(value);

    this._add({
      type: 'simple',
      title: this.res.t(data.title),
      text: this.res.t(data.text),
      icon: data.icon,
      category: data.category,
      key: data.key,
      value,
      earned: isEarned,
    });
  }

  _addSimple (data) {
    let value = this.member.achievements[data.key];
    let isEarned = Boolean(value);

    this._add({
      type: 'simple',
      title: this.res.t(data.title),
      text: this.res.t(data.text),
      icon: data.icon,
      category: data.category,
      key: data.key,
      value: data.value,
      earned: isEarned,
    });
  }

  _addSimpleWithMasterCount (data) {
    let value = this.member.achievements[data.key + 'Count'];
    let isEarned = Boolean(value);

    let text = this.res.t(data.key + 'Text') + (value == 0 ? '' : this.res.t(data.key + 'Text2', {count: value}));

    this._add({
      type: 'simple',
      title: this.res.t(data.key + 'Name'),
      text,
      icon: data.icon,
      category: data.category,
      key: data.key,
      value,
      earned: isEarned,
    });
  }

  _addSimpleWithCount (data) {
    let value = this.member.achievements[data.key];
    let isEarned = Boolean(value);

    if (!data.labels) {
      data.labels = {
        title: data.key + 'Name',
        text: data.key + 'Text',
      };
    }

    if (!value) {
      value = 0;
    }

    this._add({
      type: 'simple',
      title: this.res.t(data.labels.title),
      text: this.res.t(data.labels.text, {count: value}),
      icon: data.icon,
      category: data.category,
      key: data.key,
      value,
      earned: isEarned,
    });
  }

  _addPlural (data) {
    if (!data.altKey)
      data.altKey = data.key;

    let value = this.member.achievements[data.altKey];
    let isEarned = Boolean(value);

    // value == 0, labels.singularTitle, labels.singularText
    // value != 0, labels.pluralTitle, labels.pluralText

    if (!data.labels) {
      data.labels = {
        singularTitle: data.key + 'Singular',
        singularText: data.key + 'SingularText',

        pluralTitle: data.key + 'Name',
        pluralText: data.key + 'Text',
      };
    }

    let title = this.res.t(value === 0 ? data.labels.singularTitle : data.labels.pluralTitle, {count: value});
    let text = this.res.t(value === 0 ? data.labels.singularText : data.labels.pluralText, {count: value});

    this._add({
      type: 'plural',
      title,
      text,
      icon: data.icon,
      category: data.category,
      key: data.key,
      value,
      earned: isEarned,
    });
  }

  _addUltimateGear (data) {
    if (!data.altKey)
       data.altKey = data.key;

    let value = this.member.achievements.ultimateGearSets[data.altKey];
    let isEarned = Boolean(value);

    let title = this.res.t('ultimGearName', {ultClass: this.res.t(data.key)});
    let text = this.res.t(data.key + 'UltimGearText');

    this._add({
      type: 'ultimateGear',
      title,
      text,
      icon: data.icon,
      category: data.category,
      key: 'ultimateGear' + data.key,
      value,
      earned: isEarned,
    });
  }

  addBasicAchievements () {
    this._addPlural({
      key: 'streak',
      icon: 'achievement-thermometer',
      category: 'Basic',
    });

    this._addPlural({
      key: 'perfect',
      icon: 'achievement-perfect',
      category: 'Basic',
    });

    this._addSimple({
      key: 'partyUp',
      icon: 'achievement-partyUp',
      title: 'partyUpName',
      text: 'partyUpText',
      category: 'Basic',
    });

    this._addSimple({
      key: 'partyOn',
      icon: 'achievement-partyOn',
      title: 'partyOnName',
      text: 'partyOnText',
      category: 'Basic',
    });

    this._addSimpleWithMasterCount({
      key: 'beastMaster',
      icon: 'achievement-rat',
      category: 'Basic',
    });

    this._addSimpleWithMasterCount({
      key: 'mountMaster',
      icon: 'achievement-wolf',
      category: 'Basic',
    });

    this._addSimpleWithMasterCount({
      key: 'triadBingo',
      icon: 'achievement-triadBingo',
      category: 'Basic',
    });

    this._addUltimateGear({
      key: 'healer',
      icon: 'achievement-ultimate-healer',
      category: 'Basic',
    });

    this._addUltimateGear({
      key: 'rogue',
      icon: 'achievement-ultimate-rogue',
      category: 'Basic',
    });

    this._addUltimateGear({
      key: 'warrior',
      icon: 'achievement-ultimate-warrior',
      category: 'Basic',
    });

    this._addUltimateGear({
      key: 'mage',
      icon: 'achievement-ultimate-mage',
      category: 'Basic',
      altKey: 'wizard'
    });

    // TODO Rebirth Achievement
  }

  addSeasonalAchievements () {
    this._addPlural({
      key: 'habiticaDays',
      icon: 'achievement-habiticaDay',
      category: 'Seasonal',
      labels: {
        singularTitle: 'habiticaDay',
        singularText: 'habiticaDaySingularText',
        pluralTitle: 'habiticaDay',
        pluralText: 'habiticaDayPluralText',
      }
    });

    this._addPlural({
      key: 'habitBirthdays',
      icon: 'achievement-habitBirthday',
      category: 'Seasonal',
      labels: {
        singularTitle: 'habitBirthday',
        singularText: 'habitBirthdayText',
        pluralTitle: 'habitBirthday',
        pluralText: 'habitBirthdayPluralText',
      }
    });

    this._addSimpleWithCount({
      key: 'snowball',
      icon: 'achievement-snowball',
      category: 'Seasonal',
      labels:{
        title: 'annoyingFriends',
        text: 'annoyingFriendsText',
      }
    });

    this._addSimpleWithCount({
      key: 'spookySparkles',
      icon: 'achievement-spookySparkles',
      category: 'Seasonal',
      labels:{
        title: 'alarmingFriends',
        text: 'alarmingFriendsText',
      }
    });

    this._addSimpleWithCount({
      key: 'shinySeed',
      icon: 'achievement-shinySeed',
      category: 'Seasonal',
      labels:{
        title: 'agriculturalFriends',
        text: 'agriculturalFriendsText',
      }
    });

    this._addSimpleWithCount({
      key: 'seafoam',
      icon: 'achievement-seafoam',
      category: 'Seasonal',
      labels:{
        title: 'aquaticFriends',
        text: 'aquaticFriendsText',
      }
    });

    this._addQuest({
      key: 'dilatory',
      icon: 'achievement-dilatory',
      category: 'Seasonal',    
      title: 'achievementDilatory',
      text: 'achievementDilatoryText',
    });

    this._addQuest({
      key: 'stressbeast',
      icon: 'achievement-stoikalm',
      category: 'Seasonal',    
      title: 'achievementStressbeast',
      text: 'achievementStressbeastText',
    });

    this._addQuest({
      key: 'burnout',
      icon: 'achievement-burnout',
      category: 'Seasonal',    
      title: 'achievementBurnout',
      text: 'achievementBurnoutText',
    });

    this._addQuest({
      key: 'bewilder',
      icon: 'achievement-bewilder',
      category: 'Seasonal',    
      title: 'achievementBewilder',
      text: 'achievementBewilderText',
    });

    this._addPlural({
      key: 'costumeContests',
      icon: 'achievement-costumeContest',
      category: 'Seasonal',
      labels: {
        singularTitle: 'costumeContest',
        singularText: 'costumeContestText',
        pluralTitle: 'costumeContest',
        pluralText: 'costumeContestTextPlural',
      }
    });

    let cardAchievements = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday'];

    cardAchievements.forEach(key => {
      this._addSimpleWithCount({
        key: key,
        icon: 'achievement-' + key,
        category: 'Seasonal',
        labels:{
          title: key + 'CardAchievementTitle',
          text: key + 'CardAchievementText',
        }
      });
    });
  }

  addSpecialAchievements() {
    this._addPlural({
      key: 'habitSurveys',
      icon: 'achievement-tree',
      category: 'Special',
      labels: {
        singularTitle: 'helped',
        singularText: 'surveysSingle',
        pluralTitle: 'helped',
        pluralText: 'surveysMultiple',
      }
    });

    
    if (this.member.contributor.level) {
      this._add({
        type: 'simple',
        title: contribText(this.member.contributor, this.member.backer, this.res),
        text: this.res.t('contribText'),
        icon: 'achievement-boot',
        category: 'Special',
        key: 'contributor',
        value: this.member.contributor.level,
        earned: true,
      });
    } else {
      this._add({
        type: 'simple',
        title: this.res.t('contribName'),
        text: this.res.t('contribText'),
        icon: 'achievement-boot',
        category: 'Special',
        key: 'contributor',
        value: this.member.contributor.level,
        earned: false,
      });
    }

    if (this.member.backer.npc) {
      this._add({
        type: 'simple',
        title: this.member.backer.npc + this.res.t('npc'),
        text: this.res.t('npcText'),
        icon: 'achievement-ultimate-warrior',
        category: 'Special',
        key: 'npc',
        value: this.member.backer.npc,
        earned: true,
      });
    }

    if (this.member.backer.tier) {
      this._add({
        type: 'simple',
        title: this.res.t('kickstartName', {tier: this.member.backer.tier}),
        text: this.res.t('kickstartText'),
        icon: 'achievement-heart',
        category: 'Special',
        key: 'tier',
        value: this.member.backer.tier,
        earned: true,
      });
    }

    if (this.member.achievements.veteran) {
      this._add({
        type: 'simple',
        title: this.res.t('veteran'),
        text: this.res.t('veteranText'),
        icon: 'achievement-cake',
        category: 'Special',
        key: 'veteran',
        value: this.member.achievements.veteran,
        earned: true,
      });
    }

    if (this.member.achievements.originalUser) {
      this._add({
        type: 'simple',
        title: this.res.t('originalUser'),
        text: this.res.t('originalUserText'),
        icon: 'achievement-alpha',
        category: 'Special',
        key: 'originalUser',
        value: this.member.achievements.originalUser,
        earned: true,
      });
    }
  }

  buildAchievementsResult () {
    this.addBasicAchievements();
    this.addSeasonalAchievements();
    this.addSpecialAchievements();

    return this.result;
  }
}

// Build and return the given user's achievement data.
export function buildAchievementsResult (res, member) {
  let builder = new AchievementBuilder(res, member);
  let achievements = builder.buildAchievementsResult();
  return achievements;
}
