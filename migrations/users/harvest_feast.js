/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20241120_harvest_feast';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const updateOp = {
    $set: { migration: MIGRATION_NAME },
  };

  if (typeof user.items.gear.owned.head_special_turkeyHelmGilded !== 'undefined') {
    updateOp.$inc = {
      'items.food.Pie_Base': 1,
      'items.food.Pie_CottonCandyBlue': 1,
      'items.food.Pie_CottonCandyPink': 1,
      'items.food.Pie_Desert': 1,
      'items.food.Pie_Golden': 1,
      'items.food.Pie_Red': 1,
      'items.food.Pie_Shade': 1,
      'items.food.Pie_Skeleton': 1,
      'items.food.Pie_Zombie': 1,
      'items.food.Pie_White': 1,
    };
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_pie',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received an assortment of pie for your Pets!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  } else if (typeof user.items.gear.owned.armor_special_turkeyArmorBase !== 'undefined') {
    updateOp.$set['items.gear.owned.head_special_turkeyHelmGilded'] = true;
    updateOp.$set['items.gear.owned.armor_special_turkeyArmorGilded'] = true;
    updateOp.$set['items.gear.owned.back_special_turkeyTailGilded'] = true;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_gilded_set',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Gilded Turkey Armor, Helm, and Tail!',
          destination: '/inventory/equipment',
        },
        seen: false,
      },
    };
  } else if (user.items && user.items.mounts && user.items.mounts['Turkey-Gilded']) {
    updateOp.$set['items.gear.owned.head_special_turkeyHelmBase'] = true;
    updateOp.$set['items.gear.owned.armor_special_turkeyArmorBase'] = true;
    updateOp.$set['items.gear.owned.back_special_turkeyTailBase'] = true;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_base_set',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Turkey Armor, Helm, and Tail!',
          destination: '/inventory/equipment',
        },
        seen: false,
      },
    };
  } else if (user.items && user.items.pets && user.items.pets['Turkey-Gilded']) {
    updateOp.$set['items.mounts.Turkey-Gilded'] = true;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_gilded_mount',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Gilded Turkey Mount!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  } else if (user.items && user.items.mounts && user.items.mounts['Turkey-Base']) {
    updateOp.$set['items.pets.Turkey-Gilded'] = 5;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_gilded_pet',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Gilded Turkey Pet!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  } else if (user.items && user.items.pets && user.items.pets['Turkey-Base']) {
    updateOp.$set['items.mounts.Turkey-Base'] = true;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_base_mount',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Turkey Mount!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  } else {
    updateOp.$set['items.pets.Turkey-Base'] = 5;
    updateOp.$push = {
      notifications: {
        type: 'ITEM_RECEIVED',
        data: {
          icon: 'notif_harvestfeast_base_pet',
          title: 'Happy Harvest Feast!',
          text: 'Gobble gobble, you\'ve received the Turkey Pet!',
          destination: '/inventory/stable',
        },
        seen: false,
      },
    };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return User.updateOne({ _id: user._id }, updateOp).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2024-10-20') },
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
