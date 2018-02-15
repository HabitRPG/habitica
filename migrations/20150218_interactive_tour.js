db.users.update({}, {$set: {
  'flags.tour.intro': -2,
  // 'flags.tour.classes':-2,
  'flags.tour.stats': -2,
  'flags.tour.tavern': -2,
  'flags.tour.party': -2,
  'flags.tour.guilds': -2,
  'flags.tour.challenges': -2,
  'flags.tour.market': -2,
}}, {multi: 1});