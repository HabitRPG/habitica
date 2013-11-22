//Add defaults to show gears in all users
db.users.update(
    {},
    {$set:{
        'preferences.soundTheme': 'browserquest',
    }},
    {multi:true}
)
