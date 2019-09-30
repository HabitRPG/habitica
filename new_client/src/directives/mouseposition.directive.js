import Vue from 'vue';

import _throttle from 'lodash/throttle';

import { emit } from './directive.common';

/**
 * v-mousePosition="throttleTimeout", @mouseMoved="callback()"
 */

const EVENT_NAME = 'mouseMoved';

export default {
  bind (el, binding, vnode) {
    el.handleMouseMove = _throttle((ev) => {
      emit(vnode, EVENT_NAME, {
        x: ev.clientX,
        y: ev.clientY,
      });
    }, binding.value);

    window.addEventListener('mousemove', el.handleMouseMove);

    // send the first width
    Vue.nextTick(el.handleWindowResize);
  },

  unbind (el) {
    window.removeEventListener('mousemove', el.handleMouseMove);
  },
};
