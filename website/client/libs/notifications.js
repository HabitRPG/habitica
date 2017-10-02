export function getDropClass (item) {
  let dropClass = '';
  if (item) {
    switch (item.type) {
      case 'Egg':
        dropClass = `Pet_Egg_${item.key}`;
        break;
      case 'HatchingPotion':
        dropClass = `Pet_HatchingPotion_${item.key}`;
        break;
      case 'Food':
        dropClass = `Pet_Food_${item.key}`;
        break;
      case 'armor':
      case 'back':
      case 'body':
      case 'eyewear':
      case 'head':
      case 'headAccessory':
      case 'shield':
      case 'weapon':
        dropClass = `shop_${item.key}`;
        break;
      default:
        dropClass = 'glyphicon glyphicon-gift';
    }
  }
  return dropClass;
}
