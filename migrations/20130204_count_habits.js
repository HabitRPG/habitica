// %mongo server:27017/dbname underscore.js my_commands.js
// %mongo server:27017/dbname underscore.js --shell
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
