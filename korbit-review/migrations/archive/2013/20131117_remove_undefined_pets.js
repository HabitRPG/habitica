// once and for all!

db.users.find({'items.pets': {$exists: 1}}, {'items.pets': 1}).forEach(function (user) {
  _.reduce(user.items.pets, function (m, v, k) {
    if (!k.indexOf('undefined')) m.push(k);
    return m;
  }, []).forEach(function (key) {
    delete user.items.pets[key];
  });

  db.users.update({_id: user._id}, { $set: {'items.pets': user.items.pets} });
});
