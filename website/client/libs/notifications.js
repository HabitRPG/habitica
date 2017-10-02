export function getDropClass ({type, key}) {
  let dropClass = '';

  if (type) {
    switch (type) {
      case 'Egg':
        dropClass = `Pet_Egg_${key}`;
        break;
      case 'HatchingPotion':
        dropClass = `Pet_HatchingPotion_${key}`;
        break;
      case 'Food':
      case 'food':
        dropClass = `Pet_Food_${key}`;
        break;
      case 'armor':
      case 'back':
      case 'body':
      case 'eyewear':
      case 'head':
      case 'headAccessory':
      case 'shield':
      case 'weapon':
      case 'gear':
        dropClass = `shop_${key}`;
        break;
      default:
        dropClass = 'glyphicon glyphicon-gift';
    }
  }

  return dropClass;
}