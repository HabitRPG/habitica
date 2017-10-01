const CONSTANTS = {
  keyConstants: {
    SPELL_DRAWER_STATE: 'spell-drawer-state',
  },
  valueConstants: {
    SPELL_DRAWER_CLOSED: 'spell-drawer-closed',
    SPELL_DRAWER_OPEN: 'spell-drawer-open',
  },
};

function setLocalSetting (key, value) {
  localStorage.setItem(key, value);
}

function getLocalSetting (key) {
  return localStorage.getItem(key);
}

export {
  CONSTANTS,
  getLocalSetting,
  setLocalSetting,
};
