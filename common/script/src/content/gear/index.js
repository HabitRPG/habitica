import {translator as t} from '../helpers';
import {each, defaults} from 'lodash';
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

each(GEAR_TYPES, function(type) {
  let classTypes = classes.concat(['base', 'special', 'mystery', 'armoire']);

  each(classTypes, function(klass) {
    each(gear[type][klass], function(item, i) {
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
        let _canOwn = item.canOwn || (function() {
          return true;
        });
        item.canOwn = function(u) {
          return _canOwn(u) && ((u.items.gear.owned[key] != null) || (moment().isAfter(item.event.start) && moment().isBefore(item.event.end))) && (item.specialClass ? u.stats["class"] === item.specialClass : true);
        };
      }
      if (item.mystery) {
        item.canOwn = function(u) {
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
