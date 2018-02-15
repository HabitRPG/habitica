db.users.update({
  'flags.recaptureEmailsPhase': {
    $gt: 0,
  },
}, {$inc: {
  'flags.recaptureEmailsPhase': 1,
}}, {multi: 1});