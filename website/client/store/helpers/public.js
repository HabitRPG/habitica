/* The MIT License (MIT)

Copyright (c) 2015-2016 Evan You

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

--------------------------------------------------------------------------

mapState, mapGetters and mapActions taken from Vuex v2.0.0-rc.6 as they're compatible with our
store implementation. mapMutations is not present because we do not use mutations.

Source code https://github.com/vuejs/vuex/blob/v2.0.0-rc.6/src/helpers.js

The code has been slightly changed to match our code style and to support nested paths.
*/

import get from 'lodash/get';

function normalizeMap (map) {
  return Array.isArray(map) ?
    map.map(key => ({ key, val: key })) :
    Object.keys(map).map(key => ({ key, val: map[key] }));
}

export function mapState (states) {
  const res = {};

  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      return typeof val === 'function' ?
        val.call(this, this.$store.state, this.$store.getters) :
        get(this.$store.state, val);
    };
  });

  return res;
}

export function mapGetters (getters) {
  const res = {};

  normalizeMap(getters).forEach(({ key, val }) => {
    res[key] = function mappedGetter () {
      return this.$store.getters[val];
    };
  });

  return res;
}

export function mapActions (actions) {
  const res = {};

  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      return this.$store.dispatch.apply(this.$store, [val].concat(args)); // eslint-disable-line prefer-spread
    };
  });

  return res;
}