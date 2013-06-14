var
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
    };

print('corrupt: ' + db.users.count(corrupt));
print('unregistered: ' + db.users.count(un_registered));
print('registered: ' + db.users.count(registered));

// TODO active users
// - history > 14 entries
// - lastCron < 14d