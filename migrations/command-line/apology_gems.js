db.users.updateOne({ _id: { $in: [''] } }, { $inc: { balance: 0.5 } }, { multi: true });
