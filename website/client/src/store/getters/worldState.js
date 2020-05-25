function getWorldDamage (store) {
  const worldState = store.state.worldState.data;

  return worldState
    && worldState.worldBoss
    && worldState.worldBoss.extra
    && worldState.worldBoss.extra.worldDmg;
}

export function brokenSeasonalShop (store) {
  const worldDmg = getWorldDamage(store);
  return worldDmg && worldDmg.seasonalShop;
}

export function brokenMarket (store) {
  const worldDmg = getWorldDamage(store);
  return worldDmg && worldDmg.market;
}

export function brokenQuests (store) {
  const worldDmg = getWorldDamage(store);
  return worldDmg && worldDmg.quests;
}
