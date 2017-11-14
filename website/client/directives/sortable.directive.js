import Sortable from 'sortablejs';
import uuid from 'uuid';

let emit = (vNode, eventName, data) => {
  let handlers = vNode.data && vNode.data.on ||
    vNode.componentOptions && vNode.componentOptions.listeners;

  if (handlers && handlers[eventName]) {
    handlers[eventName].fns(data);
  }
};

let sortableReferences = {};

function createSortable (el, vNode) {
  let sortableRef = Sortable.create(el, {
    filter: '.task-dropdown', // do not make the tasks dropdown draggable or it won't work
    onSort: (evt) => {
      emit(vNode, 'onsort', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
      });
    },
  });

  let uniqueId = uuid();
  sortableReferences[uniqueId] = sortableRef;
  el.dataset.sortableId = uniqueId;
}

export default {
  bind (el, binding, vNode) {
    createSortable(el, vNode);
  },
  unbind (el) {
    if (sortableReferences[el.dataset.sortableId]) sortableReferences[el.dataset.sortableId].destroy();
  },
  update (el, vNode) {
    if (sortableReferences[el.dataset.sortableId] && !vNode.value) {
      sortableReferences[el.dataset.sortableId].destroy();
      delete sortableReferences[el.dataset.sortableId];
      return;
    }
    if (!sortableReferences[el.dataset.sortableId]) createSortable(el, vNode);
  },
};
