var migrationName = 'AccountTransfer';
var authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * This migraition will copy user data from prod to test
 */

const monk = require('monk');
const connectionString = '';
const Users = monk(connectionString).get('users', { castIds: false });

import uniq from 'lodash/uniq';
import Bluebird from 'bluebird';


module.exports = async function accountTransfer () {
  const fromAccountId = '';
  const toAccountId = '';

  const fromAccount = await Users.findOne({_id: fromAccountId});
  const toAccount = await Users.findOne({_id: toAccountId});

  const newMounts = Object.assign({}, fromAccount.items.mounts, toAccount.items.mounts);
  const newPets = Object.assign({}, fromAccount.items.pets, toAccount.items.pets);
  const newBackgrounds = Object.assign({}, fromAccount.purchased.background, toAccount.purchased.background);

  await Users.update({_id: toAccountId}, {
    $set: {
      'items.pets': newPets,
      'items.mounts': newMounts,
      'purchased.background': newBackgrounds,
    },
  })
  .then((result) => {
    console.log(result);
  });
};
