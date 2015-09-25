import {
  translator as t,
  setFoodDefaults
} from '../helpers';

const CAN_BUY = true;
const CAN_DROP = false;

let saddle = {
  Saddle: {
    value: 5,
    text: t('foodSaddleText'),
    notes: t('foodSaddleNotes'),
  },
};

setFoodDefaults(saddle, {canBuy: CAN_BUY, canDrop: CAN_DROP});

export default saddle;
