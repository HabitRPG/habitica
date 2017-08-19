/*
import {emit} from './directive.common';


import _keys from 'lodash/keys';
import _without from 'lodash/without';
*/
/**
 * DRAG_GROUP is a static custom value
 * KEY_OF_ITEM
 *
 * v-drag.DRAG_GROUP="KEY_OF_ITEM" @itemDragEnd="optional" @itemDragStart="optional"
 * v-drag.drop.DRAG_GROUP="KEY_OF_ITEM" @itemDropped="callback" @itemDragOver="optional"
 */

/*
const DROPPED_EVENT_NAME = 'itemDropped';
const DRAGSTART_EVENT_NAME = 'itemDragStart';
const DRAGEND_EVENT_NAME = 'itemDragEnd';
const DRAGOVER_EVENT_NAME = 'itemDragOver';
const DRAGLEAVE_EVENT_NAME = 'itemDragLeave';
*/
export default {
  /* bind (el, binding, vnode) {
    el.isDropHandler = binding.modifiers.drop === true;
    el.dragGroup = _without(_keys(binding.modifiers), 'drop')[0];
    el.key = binding.value;

    if (!el.isDropHandler) {
      el.draggable = true;
      el.handleDrag = (ev) => {
        ev.dataTransfer.setData('KEY', binding.value);
        let dragStartEventData = {
          event: ev,
        };

        emit(vnode, DRAGSTART_EVENT_NAME, dragStartEventData);

        if(!el.handleDragEnd) {
          el.handleDragEnd = () => {
            let dragEndEventData = {};
            emit(vnode, DRAGEND_EVENT_NAME, dragEndEventData);
          };

          // need to add the listener after the drag begin, cause its fired right after start :/
          setTimeout(function () {
            el.addEventListener('dragend', el.handleDragEnd);
          }, 50);
        }
      };
      el.addEventListener('dragstart', el.handleDrag);
    } else {
      el.handleDragOver = (ev) => {
        let dragOverEventData = {
          dropable: true,
          draggingKey: ev.dataTransfer.getData('KEY'),
          event: ev,
        };

        console.info('dragover');
        emit(vnode, DRAGOVER_EVENT_NAME, dragOverEventData);

        if (dragOverEventData.dropable) {
          ev.preventDefault();
        }
      };
      el.handleDrop = (ev) => {
        let dropEventData = {
          draggingKey: ev.dataTransfer.getData('KEY'),
        };

        console.info('dragdrop');
        emit(vnode, DROPPED_EVENT_NAME, dropEventData);
      };

      el.handleDragLeave = () => {

        console.info('dragleave');
        emit(vnode, DRAGLEAVE_EVENT_NAME, {});
      };

      el.addEventListener('dragover', el.handleDragOver);
      el.addEventListener('dragleave', el.handleDragLeave);
      el.addEventListener('drop', el.handleDrop);
    }
  }, */

  unbind (el) {
    if (!el.isDropHandler) {
      el.removeEventListener('dragstart', el.handleDrag);
      el.removeEventListener('dragend', el.handleDragEnd);
    } else {
      el.removeEventListener('dragover', el.handleDragOver);
      el.removeEventListener('dragleave', el.handleDragLeave);
      el.removeEventListener('drop', el.handleDrop);
    }
  },
};
