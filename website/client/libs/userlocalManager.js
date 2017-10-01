const CONSTANTS = {
  keyConstants: {
    SPELL_DRAWER_STATE: 'spell-drqaer-state',
  },
  valueConstants: {
    SPELL_DRAWER_CLOSED: 'spell-drqaer-closed',
    SPELL_DRAWER_OPEN: 'spell-drqaer-open',
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
