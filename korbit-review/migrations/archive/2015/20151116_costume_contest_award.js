let migrationName = '20151116_costume_contest.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award Costume Contest achievement to 2015 winners
 */

let dbserver = 'localhost:27017'; // FOR TEST DATABASE
// var dbserver = 'username:password@ds031379-a0.mongolab.com:31379'; // FOR PRODUCTION DATABASE
let dbname = 'habitrpg';

let mongo = require('mongoskin');
let _ = require('lodash');

let dbUsers = mongo.db(`${dbserver  }/${  dbname  }?auto_reconnect`).collection('users');

// specify a query to limit the affected users (empty for all users):
let query = {
  _id: {
    $in: [
      'e411dab3-a4ca-414d-bdbd-b6940b3bdeb3',
      '35ced5cc-c33a-45c8-93dc-16000ee66fde',
      'ab3f0549-7247-4fd5-975b-efcff98c79c3',
      'b1261fd2-eb25-46b4-97a9-ae7a0dc8a131',
      '1f27893f-3808-4724-9725-f46dab93faca',
      '216a0c23-6afd-4a5e-b434-d386a10862a2',
      '2d6ef231-50b4-4a22-90e7-45eb97147a2c',
      '98b8cf4f-89bd-4b0a-988d-02629a217232',
      'c5183dfa-c741-43ce-935e-c6d89b41a030',
      '262a7afb-6b57-4d81-88e0-80d2e9f6cbdc',
      '33991e0a-de55-4986-ac81-af78491a84de',
      '7adf6ada-3c05-4054-b5df-fa7d49d3b9eb',
      '235a1cbd-48c5-41b1-afb4-59d2f8645c57',
      'b7617a61-188b-4332-bf4d-32268fa77f2b',
      '672c1ce0-9f47-44f0-a3f3-8cc3c6c5a9cb',
      'd0a3217a-7b92-48d6-b39a-b1b1be96702e',
      '5ef910dc-1d22-47d9-aa38-a60132c60679',
      '370a44c8-e94a-4a2c-91f2-33166926db1f',
      '1b0b3ef3-28bd-4046-a49b-e1c83e281baf',
      '75b93321-66b9-49bd-9076-052499c1d2bf',
      'd97516e4-81d0-4f60-bf03-95f7330925ab',
      '3e13cc79-de38-420d-822e-9e9da309ce6b',
      '0e471dc1-ecb0-4388-a891-b873a237d2cf',
      'ca3da398-4f73-4304-b838-af3669ed4cbb',
      '44cdf105-8bda-4197-9d1a-1bcb83b4dc84',
      '5419830c-b837-4573-ae82-4718ab95b7f1',
      'ac6fbe37-b0dc-40d8-ba14-77dde66fbfa8',
      '8789ba18-a498-46b9-b367-3b929a0acb94',
      '52fce1a9-9b0a-4e26-95dc-adc12f52e752',
      '21bf71ac-399c-470b-abe0-cc49a03b6a8b',
      'f1618ce2-552e-4f23-bc76-e73d63ebedd0',
      '4cc0c749-d943-4090-b529-42bc665b7244',
      'e259682e-cb5c-4d94-b472-ceedc66d7484',
      'fa197a4b-e065-4551-803a-c8a5b9970f9d',
    ],
  },
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
let fields = {
};

console.warn('Updating users...');
let progressCount = 1000;
let count = 0;
dbUsers.findEach(query, fields, {batchSize: 250}, function (err, user) {
  if (err) {
    return exiting(1, `ERROR! ${  err}`);
  }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    return displayData();
  }
  count++;

  // specify user data to change:
  let set = {migration: migrationName};
  let inc = {'achievements.costumeContests': 1};

  dbUsers.update({_id: user._id}, {$set: set});
  dbUsers.update({_id: user._id}, {$inc: inc});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
});


function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}


function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}

