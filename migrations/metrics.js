// mongo habitrpg ./migrations/metrics.js

load('./node_modules/moment/moment.js');

var
    today = +new Date,
    twoWeeksAgo = +moment().subtract(14, 'days');

    corrupt = {
        $or: [
            {lastCron: {$exists:false}},
            {lastCron: 'new'}
        ]
    }

    un_registered = {
        "auth.local": {$exists: false},
        "auth.facebook": {$exists: false}
    },

    registered = {
        $or: [
            { 'auth.local': { $exists: true }},
            { 'auth.facebook': { $exists: true }}
        ]
    },

    active = {
        $or: [
            { 'auth.local': { $exists: true }},
            { 'auth.facebook': { $exists: true }}
        ],
//        $where: function(){
//            return this.history && this.history.exp && this.history.exp.length > 7;
//        },
        'lastCron': {$gt: twoWeeksAgo}
    };

print('corrupt: ' + db.users.count(corrupt));
print('unregistered: ' + db.users.count(un_registered));
print('registered: ' + db.users.count(registered));
print('active: ' + db.users.count(active));