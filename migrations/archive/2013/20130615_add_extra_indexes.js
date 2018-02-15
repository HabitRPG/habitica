db.users.ensureIndex({ _id: 1, apiToken: 1 }, {background: true});
db.groups.ensureIndex({ members: 1 }, {background: true});
db.groups.ensureIndex({ type: 1 }, {background: true});
db.groups.ensureIndex({ type: 1, privacy: 1 }, {background: true});