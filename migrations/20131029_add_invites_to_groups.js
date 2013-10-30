var groups = {};

db.users.find().forEach(function(user){
  if(user.invitations){
    if(user.invitations.party){
      groups[user.invitations.party.id] = groups[user.invitations.party.id] || [];
      groups[user.invitations.party.id].push(user._id);
    }

    if(user.invitations.guilds){
      _.each(user.invitations.guilds, function(guild){
        groups[guild.id] = groups[guild.id] || [];
        groups[guild.id].push(user._id);
      });
    }
  }
});

_.each(groups, function(usersInvited, groupId){
  try {
    db.groups.update({_id: groupId}, {$set: {'group.invites': usersInvited} });
  } catch(e) {
    print(e);
  }
});
