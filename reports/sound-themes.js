// How many users use each sound theme? Outputs count of users per theme

var userList = [];
var cursor = db.users.find({'auth.timestamps.loggedin':{$gt: new Date('2017-01-01')}},{'_id':1,'auth':1})

while (cursor.hasNext()) {
	var user = cursor.next();
	if (moment(user.auth.timestamps.loggedin).diff(user.auth.timestamps.created, 'days') > 2) {
    userList.push(user._id);
  }
}

var aggregationCursor = db.users.aggregate(
	[
		{ $match:
      { _id:
        { $in: userList }
      }
		},
		{ $group:
			{ _id:
				{ soundTheme: '$preferences.sound' },
			count:
				{ $sum: 1 }
			}
		}
	]
)

while (aggregationCursor.hasNext()) {
  var theme = aggregationCursor.next();
  print(theme._id.soundTheme + ' ' + theme.count);
}
