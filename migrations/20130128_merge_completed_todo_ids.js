db.users.find({ completedIds: { $exists: true } }).forEach(function (user) {
  let newTodoIds = user.todoIds;
  user.completedIds.forEach(function (value) {
    if (newTodoIds.indexOf(value) === -1) {
      newTodoIds.push(value);
    }
  });
  db.users.update(
    { _id: user._id },
    {
      $set: { todoIds: newTodoIds },
      $unset: { completedIds: 1 },
    }
  );
});