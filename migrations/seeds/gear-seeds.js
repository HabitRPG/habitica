import Bluebird from 'bluebird';

import { model as Gear } from '../../website/server/models/gear';
import common from '../../website/common';

module.exports = async function seedGear () {
  // console.log(Object.keys(common.content.gear.flat))
  let gear = common.content.gear.flat;
  // event: EVENTS.winter,
  //     specialClass: 'rogue',
  // gearSet
  // mystery

  var count = 0;
  let promises = [];

  for (let itemKey in gear) {
    let item = gear[itemKey];

    let newGearItem = new Gear();
    newGearItem.text = item.text;
    if (item.textlocaleKey) newGearItem.text = item.textlocaleKey;
    newGearItem.notes = item.notes;
    if (item.textlocaleKey) newGearItem.text = item.notelocaleKey;
    newGearItem.twoHanded = item.twoHanded;
    newGearItem.per = item.per;
    newGearItem.int = item.int;
    newGearItem.str = item.str;
    newGearItem.con = item.con;
    newGearItem.value = item.value;
    newGearItem.type = item.type;
    newGearItem.key = item.key;
    newGearItem.setKey = item.set;
    newGearItem.klass = item.klass;
    newGearItem.index = item.index;

    // @TODO: Add upsert

    promises.push(newGearItem.save())
    count += 1;
  }

  console.log(count)

  await Bluebird.all(promises);

  // gear.text = "test";
  // let result = await gear.save();
  // console.log(result)
}
