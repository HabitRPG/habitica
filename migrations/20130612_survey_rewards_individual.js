//mongo habitrpg migrations/20130612_survey_rewards_individual.js

var query = {_id: ""};

db.users.update(query,
    {
        $set: { 'achievements.helpedHabit': true },
        $inc: { balance: 2.5 }
    })