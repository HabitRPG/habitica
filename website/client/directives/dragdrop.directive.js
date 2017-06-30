import {emit} from './directive.common';

import _keys from 'lodash/keys';
import _without from 'lodash/without';

/**
 * DRAG_GROUP is a static custom value
 * KEY_OF_ITEM
 *
 * v-drag.DRAG_GROUP="KEY_OF_ITEM"
 * v-drag.drop.DRAG_GROUP="KEY_OF_ITEM" @dropped="callback" @dragover="optional"
 */

const DROPPED_EVENT_NAME = 'dropped';
const DRAGOVER_EVENT_NAME = 'dragover';

export default {
  bind (el, binding, vnode) {
    el.isDropHandler = binding.modifiers.drop === true;
    el.dragGroup = _without(_keys(binding.modifiers), 'drop')[0];
    el.key = binding.value;

    if (!el.isDropHandler) {
      el.draggable = true;
      el.handleDrag = (ev) => {
        ev.dataTransfer.setData('KEY', binding.value);
      };
      el.addEventListener('dragstart', el.handleDrag);
    } else {
      el.handleDragOver = (ev) => {
        let dragOverEventData = {
          dropable: true,
          draggingKey: ev.dataTransfer.getData('KEY'),
        };

        emit(vnode, DRAGOVER_EVENT_NAME, dragOverEventData);

        if (dragOverEventData.dropable) {
          ev.preventDefault();
        }
      };
      el.handleDrop = (ev) => {
        let dropEventData = {
          draggingKey: ev.dataTransfer.getData('KEY'),
        };

        emit(vnode, DROPPED_EVENT_NAME, dropEventData);
      };

      el.addEventListener('dragover', el.handleDragOver);
      el.addEventListener('drop', el.handleDrop);
    }
  },

  unbind (el) {
    if (!el.isDropHandler) {
      el.removeEventListener('drag', el.handleDrag);
    } else {
      el.removeEventListener('dragover', el.handleDragOver);
      el.removeEventListener('drop', el.handleDrop);
    }
  },
};
