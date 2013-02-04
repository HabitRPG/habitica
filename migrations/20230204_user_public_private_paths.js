db.users.find({}).forEach(function(user){

    // New user schema has public and private paths, so we can setup proper access control with racer
    // Note 'public' and 'private' are reserved words
    var newUser = {
        pub:{},
        priv: {}
    };

    newUser.priv.lastCron = user.lastCron;
    user.priv.balance = user.balance;
    user.priv.tasks = user.tasks;

    // ------------ Stats
    // rename money to gp
    user.stats.gp = user.stats.money;
    delete user.stats.money;
    newUser.pub.stats = user.stats;

    // ------------ Party
    newUser.pub.party = null;


    // ------------ ID lists
    newUser.priv.idLists = {habit:user.habitList, daily:user.dailyList, todo:user.todoList, reward:user.rewardList};


    // ------------ Flags
    newUser.priv.flags = user.flags || {};

    user.priv.partyEnabled = false;

    user.priv.flags.itemsEnabled = user.items.itemsEnabled;
    delete user.items.itemsEnabled;

    // Items
    user.pub.items = user.items;

    // kickstarter
    if (!user.notifications || !user.notifications.kickstarter) user.notifications = {kickstarter:'show'}
    newUser.priv.flags.kickstarter = user.notifications.kickstarter;

    // Ads
    newUser.priv.flags.ads = user.flags.ads;

    // ------------ API Token
    newUser.priv.apiToken = user.preferences.api_token;
    delete user.preferences.api_token;

    // ------------ Preferences
    newUser.pub.preferences = user.preferences;



    db.users.update({_id:user.id}, newUser, {multi:true});
})