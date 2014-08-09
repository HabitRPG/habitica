// https://github.com/HabitRPG/habitrpg/issues/3801
// Convert contributors of Tier 7 with admin flag to Tier 8 (moderators).
// Convert contributors of Tier 8 to Tier 9 (staff) (all Tier 8s are admins).

db.users.update(
	{
		'contributor.admin':true,
		'contributor.level':{$gte:7}
	},
	{
		$inc: { 'contributor.level': 1 }
	},
	{ multi: true }
);

/*
db.users.find({_id : ObjectId("6")})
db.users.find(
	{
		'contributor.admin':true,
		'contributor.level':{$gte:7}
	},
	{
		'username':1,
		'profile.name':1,
		'contributor.level':1,
		'contributor.admin':1
	}
);
*/
