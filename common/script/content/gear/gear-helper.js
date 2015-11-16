export function ownsItem (item) {
  return (user) => {
    return item && user.items.gear.owned[item];
  };
}
