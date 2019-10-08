const oldId = '';
const newId = '';
const newUser = db.users.findOne({ _id: newId });

db.users.update({ _id: oldId }, { $set: { auth: newUser.auth } });

// remove the auth on the new user (which is a template account).
// The account will be preened automatically later,
// this allows us to keep the account around a few days in case there was a mistake
db.users.update({ _id: newId }, { $unset: { auth: 1 } });
