import Sortable from 'sortablejs';

let emit = (vnode, eventName, data) => {
  let handlers = vnode.data && vnode.data.on ||
    vnode.componentOptions && vnode.componentOptions.listeners;

  if (handlers && handlers[eventName]) {
    handlers[eventName].fns(data);
  }
};

export default {
  bind (el, binding, vnode) {
    Sortable.create(el, {
      onSort: (evt) => {
        emit(vnode, 'onsort', {
          oldIndex: evt.oldIndex,
          newIndex: evt.newIndex,
        });
      },
    });
  },
};
