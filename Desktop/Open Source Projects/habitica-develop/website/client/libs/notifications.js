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

export function getSign (number) {
  let sign = '+';

  if (number && number < 0) {
    sign = '-';
  }

  return sign;
}

export function round (number, nDigits) {
  return Math.abs(number.toFixed(nDigits || 1));
}

export function getXPMessage (val) {
  if (val < -50) return; // don't show when they level up (resetting their exp)
  return `${getSign(val)} ${round(val)}`;
}