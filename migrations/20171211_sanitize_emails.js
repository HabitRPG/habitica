/*
  User creation saves email as lowercase, but updating an email did not.
  Run this script to ensure all lowercased emails in db AFTER fix for updating emails is implemented.
  This will fix inconsistent querying for an email when attempting to password reset.
*/

db.users.find({'auth.local.email':{$not: /[A-Z]/}}).forEach(user => {
  db.users.update(
    { _id: user._id },
    { $set: {
      'auth.local.email': user.auth.local.email.toLowerCase()
    }}
  )
});