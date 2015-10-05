import {each, defaults} from 'lodash';
import moment from 'moment';

//--------------------------------------------------
// Gear is structured by equipment type, but organized by set. Each set exports the equipment for each type that it has
//
// The class sets have numbered key values, as they are purchased sequentially
//
// <equipment_key> : {
//  key: <gear_type>_<set_name>_<index>,
//  type: <gear_type>,
//  klass: <set_name>,
//  index: <index>,
//  text: t(<gear_type><set_name><formatted_equipment_key>Text),
//  notes: t(<gear_type><set_name><formatted_equipment_key>Notes {
//    <gear_attributes>
//  }),
//  con: <con_value>,
//  int: <int_value>,
//  per: <per_value>,
//  str: <str_value>,
//  value: <value>,
//  last: <last_boolean>,
//
//  event: <event>,
//  canOwn: <canOwn_function>,
//  mystery: <mystery_set_key>
// }
//
//  <gear_type> - What type of euqipment it is (armor, head, weapon, etc)
//  <set_name> - What set this gear is a part of (special, mystery, warrior, etc)
//  <index> - The order in this particular set
//  <formatted_equipment_key> - CamelCased version of key
//
//  <gear_attributes> - if gear has stat bonuses, they are automatically applied to notes
//
//  <con_value> - Boost to con, defaults to 0
//  <int_value> - Boost to int, defaults to 0
//  <per_value> - Boost to per, defaults to 0
//  <str_value> - Boost to str, defaults to 0
//
//  <value> - Price in gold
//  <last_boolean> - whether this is the last in a particular class set
//
//  <event> - the event key, present if gear is part of an event
//  <canOwn_function> - a function that determines whether or not gear can be purchased in the rewards column
//  <mystery_set_key> - the mystery set key, present if item is a mystery item
//
//--------------------------------------------------

import classes from '../classes';

import weapon from './weapon';
import armor from './armor';
import head from './head';
import shield from './shield';
import back from './back';
import body from './body';
import headAccessory from './head-accessory';
import eyewear from './eyewear';

const GEAR_TYPES = [ 'weapon', 'armor', 'head', 'shield', 'body', 'back', 'headAccessory', 'eyewear']

let gear = {
  weapon: weapon,
  armor: armor,
  head: head,
  shield: shield,
  back: back,
  body: body,
  headAccessory: headAccessory,
  eyewear: eyewear,
};

let flat = {};


// The gear is exported as a tree (defined above), and a flat list (eg, {weapon_healer_1: .., shield_special_0: ...}) since
// they are needed in different forms at different points in the app

each(GEAR_TYPES, (type) => {
  let classTypes = classes.concat(['base', 'special', 'mystery', 'armoire']);

  each(classTypes, (klass) => {
    each(gear[type][klass], (item, i) => {
      let key = type + "_" + klass + "_" + i;
      defaults(item, {
        type: type,
        key: key,
        klass: klass,
        index: i,
        str: 0,
        int: 0,
        per: 0,
        con: 0
      });
      if (item.event) {
        let _canOwn = item.canOwn || (() => {
          return true;
        });
        item.canOwn = (u) => {
          return _canOwn(u) && ((u.items.gear.owned[key] != null) || (moment().isAfter(item.event.start) && moment().isBefore(item.event.end))) && (item.specialClass ? u.stats["class"] === item.specialClass : true);
        };
      }
      if (item.mystery) {
        item.canOwn = (u) => {
          return u.items.gear.owned[key] != null;
        };
      }
      flat[key] = item;
    });
  });
});

export default {
  tree: gear,
  flat: flat,
  gearTypes: GEAR_TYPES
};
