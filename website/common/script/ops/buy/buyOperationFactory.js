import {AbstractBuyOperation} from './abstractBuyOperation';



/**
 *
 * @param String type
 * @param {} req
 * @returns {AbstractBuyOperation}
 */
export function buyFactory (type, req, user, analytics) {
  switch (type) {

    default: return new BuyGearOperation(user, req, analytics);
  }
}
