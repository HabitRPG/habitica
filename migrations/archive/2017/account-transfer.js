/*
let migrationName = 'AccountTransfer';
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done
*/

/*
 * This migraition will copy user data from prod to test
 */

import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies

const connectionString = '';
const Users = monk(connectionString).get('users', { castIds: false });

export default async function accountTransfer () {
  const fromAccountId = '';
  const toAccountId = '';

  const fromAccount = await Users.findOne({ _id: fromAccountId });
  const toAccount = await Users.findOne({ _id: toAccountId });

  const newMounts = { ...fromAccount.items.mounts, ...toAccount.items.mounts };
  const newPets = { ...fromAccount.items.pets, ...toAccount.items.pets };
  const newBackgrounds = { ...fromAccount.purchased.background, ...toAccount.purchased.background };

  await Users.update({ _id: toAccountId }, {
    $set: {
      'items.pets': newPets,
      'items.mounts': newMounts,
      'purchased.background': newBackgrounds,
    },
  })
    .then(result => {
      console.log(result);
    });
}
