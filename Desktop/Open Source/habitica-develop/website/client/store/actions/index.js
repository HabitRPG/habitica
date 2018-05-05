import { flattenAndNamespace } from 'client/libs/store/helpers/internals';

import * as common from './common';
import * as user from './user';
import * as tasks from './tasks';
import * as guilds from './guilds';
import * as party from './party';
import * as members from './members';
import * as auth from './auth';
import * as quests from './quests';
import * as challenges from './challenges';
import * as chat from './chat';
import * as notifications from './notifications';
import * as tags from './tags';
import * as hall from './hall';
import * as shops from './shops';
import * as snackbars from './snackbars';

// Actions should be named as 'actionName' and can be accessed as 'namespace:actionName'
// Example: fetch in user.js -> 'user:fetch'

const actions = flattenAndNamespace({
  common,
  user,
  tasks,
  guilds,
  party,
  members,
  auth,
  quests,
  challenges,
  chat,
  notifications,
  tags,
  hall,
  shops,
  snackbars,
});

export default actions;
