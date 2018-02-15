db.users.update({}, {$set: {'achievements.habitBirthday': true}}, {multi: 1});
