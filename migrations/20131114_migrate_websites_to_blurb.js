// Migrate all users websites to the profile blurb field
db.users.find({'profile.websites':{$exists: true}}).forEach(function(user){
    db.users.update({_id: user._id}, {
        $set: {"profile.blurb": user.profile.blurb + '\n * ' + user.profile.websites.join('\n * ')},
        $unset: {'profile.websites': ''}
    })
})
