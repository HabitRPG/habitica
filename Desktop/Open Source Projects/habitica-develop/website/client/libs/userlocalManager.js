// @TODO: This might become too generic. If so, check the refactor docs
const CONSTANTS = {
  keyConstants: {
    SPELL_DRAWER_STATE: 'spell-drawer-state',
    EQUIPMENT_DRAWER_STATE: 'equipment-drawer-state',
  },
  valueConstants: {
    DRAWER_CLOSED: 'drawer-closed',
    DRAWER_OPEN: 'drawer-open',
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
