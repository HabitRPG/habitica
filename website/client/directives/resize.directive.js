import Vue from 'vue';

import _throttle from 'lodash/throttle';

import { emit } from './directive.common';

/**
 * v-resize="throttleTimeout", @resized="callback()"
 */

const EVENT_NAME = 'resized';

export default {
  bind (el, binding, vnode) {
    el.handleWindowResize = _throttle(() => {
      emit(vnode, EVENT_NAME, {
        width: el.clientWidth,
        height: el.clientHeight,
      });
    }, binding.value);

    window.addEventListener('resize', el.handleWindowResize);

    // send the first width
    Vue.nextTick(el.handleWindowResize);
  },

  unbind (el) {
    window.removeEventListener('resize', el.handleWindowResize);
  },
};
