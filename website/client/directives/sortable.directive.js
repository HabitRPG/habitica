import Sortable from 'sortablejs';

var emit = (vnode, name, data) => {
  var handlers = (vnode.data && vnode.data.on) ||
    (vnode.componentOptions && vnode.componentOptions.listeners);

  if (handlers && handlers[name]) {
    handlers[name].fns(data);
  }
}

export default {
  bind (el, binding, vnode) {

    Sortable.create(el, {
      onSort: (evt) => {
        emit(vnode, 'onsort' , {
          oldIndex: evt.oldIndex,
          newIndex: evt.newIndex,
        });
    	},
    });
  },
};
