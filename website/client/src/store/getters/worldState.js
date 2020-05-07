export function brokenSeasonalShop (store) {
  const worldState = store.state.worldState.data;

  return worldState
    && worldState.worldBoss
    && worldState.worldBoss.extra
    && worldState.worldBoss.extra.worldDmg
    && worldState.worldBoss.extra.worldDmg.seasonalShop;
}

export function brokenMarket (store) {
  const worldState = store.state.worldState.data;

  return worldState
    && worldState.worldBoss
    && worldState.worldBoss.extra
    && worldState.worldBoss.extra.worldDmg
    && worldState.worldBoss.extra.worldDmg.market;
}

export function brokenQuests (store) {
  const worldState = store.state.worldState.data;

  return worldState
    && worldState.worldBoss
    && worldState.worldBoss.extra
    && worldState.worldBoss.extra.worldDmg
    && worldState.worldBoss.extra.worldDmg.quests;
}
