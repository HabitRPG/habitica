import mongoose from 'mongoose';
import assert from 'assert';

const Customer = mongoose.model('Customer', new mongoose.Schema({ name: String }));

export function transactionExample () {
  let session = null;

  return Customer.createCollection()
    .then(() => Customer.remove({}).exec())
    .then(() => console.log('Test collection ready.'))
    .then(() => mongoose.startSession())
    .then(_session => {
      console.log('Session started.');
      session = _session;
      // Start a transaction
      session.startTransaction();
      console.log('Transaction started.');
      // This `create()` is part of the transaction because of the `session`
      // option.
      return Customer.create([{ name: 'Test' }], { session });
    })
    .then(() => console.log('Doc created in transaction.'))
    // Transactions execute in isolation, so unless you pass a `session`
    // to `findOne()` you won't see the document until the transaction
    // is committed.
    .then(() => Customer.findOne({ name: 'Test' }))
    .then(doc => {
      assert.ok(!doc);
      console.log('Doc not found outside collection: OK.');
    })
    // This `findOne()` will return the doc, because passing the `session`
    // means this `findOne()` will run as part of the transaction.
    .then(() => Customer.findOne({ name: 'Test' }).session(session))
    .then(doc => {
      assert.ok(doc);
      console.log('Doc found outside collection: OK.');
    })
    // Once the transaction is committed, the write operation becomes
    // visible outside of the transaction.
    .then(() => session.commitTransaction())
    .then(() => console.log('Transaction committed.'))
    .then(() => Customer.findOne({ name: 'Test' }))
    .then(doc => {
      assert.ok(doc);
      console.log('Doc found outside session: OK.');
    })
    .then(() => session.endSession())
    .then(() => console.log('Session ended.'));
}
