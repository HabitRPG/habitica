import {
  expectValidTranslationString,
  describeEachItem
} from '../helpers/content.helper';
import {each} from 'lodash';

import {
  habits,
  dailys,
  todos,
  rewards,
  tags
} from '../../common/script/src/content/user-defaults';

describe('User Defaults', () => {
  let tasks = {
    habits: habits,
    dailys: dailys,
    todos: todos,
    rewards: rewards
  };

  describeEachItem('Tasks', tasks, (type, name) => {
    each(type, (task, index) => {
      it('has a valid text attribute', () => {
        expectValidTranslationString(task.text);
      });

      it('has a valid type attribute', () => {
        expect(task.type).to.match(/todo|daily|habit|reward/);
      });

      if (task.notes) {
        it('has a valid notes attribute', () => {
          expectValidTranslationString(task.notes);
        });
      }
    });
  });

  describeEachItem('Tags', tags, (tag, index) => {

      it('has a valid name attribute', () => {
        expectValidTranslationString(tag.name);
      });
  });
});
