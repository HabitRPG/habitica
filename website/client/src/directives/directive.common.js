// https://stackoverflow.com/a/40720172/1298154
export const emit = (vnode, emitName, data) => { // eslint-disable-line import/prefer-default-export
  const handlers = (vnode.data
    && vnode.data.on)
    || (vnode.componentOptions
    && vnode.componentOptions.listeners);

  if (handlers && handlers[emitName]) {
    handlers[emitName].fns(data);
  }
};
