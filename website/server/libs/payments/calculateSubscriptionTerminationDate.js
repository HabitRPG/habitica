import moment from 'moment';

const DEFAULT_REMAINING_DAYS = 30;
const DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN = 2;

export default function calculateSubscriptionTerminationDate (
  nextBill,
  purchasedPlan,
  groupPlanCustomerId,
) {
  const defaultRemainingDays = purchasedPlan.customerId === groupPlanCustomerId
    ? DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN : DEFAULT_REMAINING_DAYS;

  const extraMonths = Math.max(purchasedPlan.extraMonths, 0);
  const extraDays = Math.ceil(30.5 * extraMonths);

  // rebuilding it from "today + rounded days" could land a day
  // late depending on the time of day
  const calculatedTerminationDate = (nextBill
    ? moment(nextBill)
    : moment().startOf('day').add(defaultRemainingDays, 'days')
  ).add(extraDays, 'days');

  // If a termination date is already set, use the one further in the future
  if (purchasedPlan.dateTerminated) {
    return calculatedTerminationDate.isBefore(purchasedPlan.dateTerminated)
      ? purchasedPlan.dateTerminated : calculatedTerminationDate.toDate();
  }

  // Otherwise the calculated one
  return calculatedTerminationDate.toDate();
}
