import Vue from 'vue';

import _throttle from 'lodash/throttle';

// https://stackoverflow.com/a/40720172/1298154
const emit = (vnode, emitName, data) => {
  let handlers = vnode.data && vnode.data.on || vnode.componentOptions && vnode.componentOptions.listeners;

  if (handlers && handlers[emitName]) {
    handlers[emitName].fns(data);
  }
};

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
