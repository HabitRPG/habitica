// mongo habitrpg node_modules/lodash/lodash.js ./migrations/20140712_wiped_quest_membership.js
db.groups.find({type: 'party', 'quest.key': {$ne: null}, 'quest.active': true}, {quest: 1}).forEach(function (group) {
  let activeMembers = _.reduce(group.quest.members, function (m, v, k) {
    if (v === true) m.push(k); return m;
  }, []);
  db.users.update(
    {_id: {$in: activeMembers}},
    {$set: {'party.quest.key': group.quest.key, 'party.quest.completed': null}},
    {multi: true}
  );
});
