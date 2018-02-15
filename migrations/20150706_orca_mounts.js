/**
 * Created by Sabe on 7/6/2015.
 */
db.users.update(
  {},
  {$set: {'items.mounts.Orca-Base': true}},
  {multi: true}
);
