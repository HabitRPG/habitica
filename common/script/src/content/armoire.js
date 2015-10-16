import {contains} from 'lodash';
import {translator as t} from './helpers';

let armoire = {
  type: 'armoire',
  text: t('armoireText'),
  notes: ((user, count) => {
    if (user.flags.armoireEmpty) {
      return t('armoireNotesEmpty')();
    }
    return t('armoireNotesFull')() + count;
  }),
  value: 100,
  key: 'armoire',
  canOwn: ((user) => {
    return contains(user.achievements.ultimateGearSets, true);
  })
};

export default armoire;
