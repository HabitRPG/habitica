/**
 * Created by Sabe on 3/25/2015.
 */
db.users.update(
  {},
  {$inc:{'items.quest.egg':1}},
  {multi:1}
)