// move idList back to root-level, is what's causing the sort bug - see https://github.com/codeparty/racer/pull/73

// We could just delete user.idLists, since it's re-created on refresh. However, users's first refresh will scare them
// since everything will dissappear - second refresh will bring everything back.
db.users.find().forEach(function (user) {
  if (!user.idLists) return;
  db.users.update(
    {_id: user._id},
    {
      $set: {
        habitIds: user.idLists.habit,
        dailyIds: user.idLists.daily,
        todoIds: user.idLists.todo,
        rewardIds: user.idLists.reward,
      },
      // $unset:{idLists:true} // run this after the code has been pushed
    }
  );
});