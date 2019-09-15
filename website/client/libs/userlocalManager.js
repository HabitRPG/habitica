// @TODO: This might become too generic. If so, check the refactor docs
const CONSTANTS = {
  keyConstants: {
    SPELL_DRAWER_STATE: 'spell-drawer-state',
    EQUIPMENT_DRAWER_STATE: 'equipment-drawer-state',
    CURRENT_EQUIPMENT_DRAWER_TAB: 'current-equipment-drawer-tab',
    STABLE_SORT_STATE: 'stable-sort-state',
  },
  drawerStateValues: {
    DRAWER_CLOSED: 'drawer-closed',
    DRAWER_OPEN: 'drawer-open',
  },
  equipmentDrawerTabValues: {
    COSTUME_TAB: 'costume-tab',
    EQUIPMENT_TAB: 'equipment-tab',
  },
  savedAppStateValues: {
    SAVED_APP_STATE: 'saved-app-state',
  },
};

function setLocalSetting (key, value) {
  localStorage.setItem(key, value);
}

function getLocalSetting (key) {
  return localStorage.getItem(key);
}

function removeLocalSetting (key) {
  return localStorage.removeItem(key);
}


export {
  CONSTANTS,
  getLocalSetting,
  setLocalSetting,
  removeLocalSetting,
};
