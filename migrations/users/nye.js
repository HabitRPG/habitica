/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20231228_nye';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const updateOp = {
    $set: { migration: MIGRATION_NAME },
    $push: { },
  };
  const data = {
    title: 'Happy New Year!',
    destination: '/inventory/equipment',
  };

  if (typeof user.items.gear.owned.head_special_nye2023 !== 'undefined') {
    updateOp.$inc = {
      'items.food.Candy_Skeleton': 1,
      'items.food.Candy_Base': 1,
      'items.food.Candy_CottonCandyBlue': 1,
      'items.food.Candy_CottonCandyPink': 1,
      'items.food.Candy_Shade': 1,
      'items.food.Candy_White': 1,
      'items.food.Candy_Golden': 1,
      'items.food.Candy_Zombie': 1,
      'items.food.Candy_Desert': 1,
      'items.food.Candy_Red': 1,
    };
    data.icon = 'notif_candy_nye';
    data.text = 'You’ve received an assortment of candy to celebrate with your Pets!';
    data.destination = '/inventory/stable';
  } else if (typeof user.items.gear.owned.head_special_nye2022 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2023'] = true;
    data.icon = 'notif_2023hat_nye';
    data.text = 'Take on your resolutions with style in this Ludicrous Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2021 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2022'] = true;
    data.icon = 'notif_2022hat_nye';
    data.text = 'Take on your resolutions with style in this Fabulous Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2020 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2021'] = true;
    data.icon = 'notif_2021hat_nye';
    data.text = 'Take on your resolutions with style in this Preposterous Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2019 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2020'] = true;
    data.icon = 'notif_2020hat_nye';
    data.text = 'Take on your resolutions with style in this Extravagant Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2018 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2019'] = true;
    data.icon = 'notif_2019hat_nye';
    data.text = 'Take on your resolutions with style in this Outrageous Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2017 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2018'] = true;
    data.icon = 'notif_2018hat_nye';
    data.text = 'Take on your resolutions with style in this Outlandish Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2016 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2017'] = true;
    data.icon = 'notif_2017hat_nye';
    data.text = 'Take on your resolutions with style in this Fanciful Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2015 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2016'] = true;
    data.icon = 'notif_2016hat_nye';
    data.text = 'Take on your resolutions with style in this Whimsical Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye2014 !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2015'] = true;
    data.icon = 'notif_2015hat_nye';
    data.text = 'Take on your resolutions with style in this Ridiculous Party Hat!';
  } else if (typeof user.items.gear.owned.head_special_nye !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_nye2014'] = true;
    data.icon = 'notif_2014hat_nye';
    data.text = 'Take on your resolutions with style in this Silly Party Hat!';
  } else {
    updateOp.$set['items.gear.owned.head_special_nye'] = true;
    data.icon = 'notif_2013hat_nye';
    data.text = 'Take on your resolutions with style in this Absurd Party Hat!';
  }

  updateOp.$push.notifications = {
    type: 'ITEM_RECEIVED',
    data,
    seen: false,
  };

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return User.updateOne({ _id: user._id }, updateOp).exec();
}

export default async function processUsers () {
  const query = {
    'auth.timestamps.loggedin': { $gt: new Date('2023-12-01') },
    migration: { $ne: MIGRATION_NAME },
  };

  const fields = {
    _id: 1,
    items: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
}
