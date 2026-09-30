import lodashFind from 'lodash/find';
import reduce from 'lodash/reduce';
import includes from 'lodash/includes';
import content from '../content/index';
import i18n from '../i18n';

export default function ultimateGear (user) {
  const owned = user.items.gear.owned.toObject
    ? user.items.gear.owned.toObject()
    : user.items.gear.owned;

  content.classes.forEach(klass => {
    if (user.achievements.ultimateGearSets[klass] !== true) {
      user.achievements.ultimateGearSets[klass] = reduce(['armor', 'shield', 'head', 'weapon'], (soFarGood, type) => {
        const found = lodashFind(content.gear.tree[type][klass], {
          last: true,
        });
        return soFarGood && (!found || owned[found.key] === true);
      }, true);

      if (user.achievements.ultimateGearSets[klass] === true) {
        if (user.addNotification) {
          const { language } = user.preferences;
          user.addNotification(
            'ACHIEVEMENT',
            {
              achievement: `ultimateGearSets.${klass}`,
              icon: `achievement-ultimate-${klass === 'wizard' ? 'mage' : klass}`,
              message: i18n.t('ultimGearName', { ultClass: i18n.t(klass, language) }, language),
              modalText: i18n.t('gearAchievementNotification'),
            },
          );
        }
      }
    }
  });

  let ultimateGearSetValues;
  if (user.achievements.ultimateGearSets.toObject) {
    ultimateGearSetValues = Object.values(user.achievements.ultimateGearSets.toObject());
  } else {
    ultimateGearSetValues = Object.values(user.achievements.ultimateGearSets);
  }

  const hasFullSet = includes(ultimateGearSetValues, true);

  if (hasFullSet && user.flags.armoireEnabled !== true) {
    user.flags.armoireEnabled = true;
  }
}
