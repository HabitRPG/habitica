// How many Guilds are users members of? Outputs counts of users with each number of Guilds
// Run using migration-runner.js

var aggregationCursor = db.users.aggregate(
	[
		{ $match:
      {'auth.timestamps.loggedin':{$gt: new Date('2017-01-01')}}
		},
		{ $group:
			{ _id:
				{ $size: '$guilds' },
			count:
				{ $sum: 1 }
			}
		}
	]
)

while (aggregationCursor.hasNext()) {
  printjson(aggregationCursor.next());
}
