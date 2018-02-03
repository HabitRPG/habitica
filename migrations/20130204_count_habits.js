// %mongo server:27017/dbname underscore.js my_commands.js
// %mongo server:27017/dbname underscore.js --shell

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var habits = 0,
    dailies = 0,
    todos = 0,
    registered = { $or: [     { 'auth.local': { $exists: true } },     { 'auth.facebook': { $exists: true} }   ]};

db.user.find(registered).forEach(function(u){
    //TODO this isn't working??
    habits += _.where(u.tasks, {type:'habit'}).length;
    dailies += _.where(u.tasks, {type:'daily'}).length;
    todos += _.where(u.tasks, {type:'todo'}).length;
})
