// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130307_remove_duff_histories.js
/**
 * Remove duff histories for dailies
 */
db.users.find().forEach(function(user){


    _.each(user.tasks, function(task, key){
        // remove task history 
        if (task.type === "daily") {
            task.history = []
        }
    });

    try {
        db.users.update(
            {_id:user._id},
            {$set:
                {
                'tasks' : user.tasks
                }
            },
            {multi:true}
        );
    } catch(e) {
        print(e);
    }
})