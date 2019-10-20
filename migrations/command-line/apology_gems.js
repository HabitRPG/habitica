db.users.update({ _id: { $in: [''] } }, { $inc: { balance: 0.5 } }, { multi: true });
