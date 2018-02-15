db.users.update(
  {'achievements.helpedHabit': true},
  {$set: {'achievements.habitSurveys': 1}},
  {multi: 1}
);