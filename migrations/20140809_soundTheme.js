//Add defaults to show gears in all users
db.users.update(
    {},
    {$set:{
        'preferences.soundTheme': 'danielTheBard',
        'preferences.sound': 1
    }},
    {multi:true}
)
