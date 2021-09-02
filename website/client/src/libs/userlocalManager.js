// @TODO: This might become too generic. If so, check the refactor docs
const CONSTANTS = {
  keyConstants: {
    SPELL_DRAWER_STATE: 'spell-drawer-state',
    EQUIPMENT_DRAWER_STATE: 'equipment-drawer-state',
    CURRENT_EQUIPMENT_DRAWER_TAB: 'current-equipment-drawer-tab',
    STABLE_SORT_STATE: 'stable-sort-state',
    ONBOARDING_PANEL_STATE: 'onboarding-panel-state',
    TASKS_CREATED_COUNT: 'tasks-created-count',
    TASKS_SCORED_COUNT: 'tasks-scored-count',
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
  onboardingPanelValues: {
    PANEL_OPENED: 'onboarding-panel-opened',
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
