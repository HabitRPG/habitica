import Sortable from 'sortablejs';
import uuid from 'uuid';

let emit = (vnode, eventName, data) => {
  let handlers = vnode.data && vnode.data.on ||
    vnode.componentOptions && vnode.componentOptions.listeners;

  if (handlers && handlers[eventName]) {
    handlers[eventName].fns(data);
  }
};

let sortableReferences = {};

export default {
  bind (el, binding, vnode) {
    let sortableRef = Sortable.create(el, {
      onSort: (evt) => {
        emit(vnode, 'onsort', {
          oldIndex: evt.oldIndex,
          newIndex: evt.newIndex,
        });
      },
    });

    let uniqueId = uuid();
    sortableReferences[uniqueId] = sortableRef;
    el.dataset.sortableId = uniqueId;
  },
  unbind (el) {
    sortableReferences[el.dataset.sortableId].destroy();
  },
  update (el, vNode) {
    sortableReferences[el.dataset.sortableId].option('disabled', !vNode.value);
  },
};
