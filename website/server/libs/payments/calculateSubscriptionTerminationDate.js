import moment from 'moment';

const DEFAULT_REMAINING_DAYS = 30;
const DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN = 2;

export default function calculateSubscriptionTerminationDate (
  nextBill, purchasedPlan, groupPlanCustomerId,
) {
  const defaultRemainingDays = purchasedPlan.customerId === groupPlanCustomerId
    ? DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN : DEFAULT_REMAINING_DAYS;

  const remaining = nextBill
    ? moment(nextBill).diff(new Date(), 'days', true)
    : defaultRemainingDays;

  const extraMonths = Math.max(purchasedPlan.extraMonths, 0);
  const extraDays = Math.ceil(30.5 * extraMonths);

  const calculatedTerminationDate = moment().startOf('day').add({ days: remaining + extraDays });

  return calculatedTerminationDate.isBefore(purchasedPlan.terminationDate)
    ? purchasedPlan.terminationDate : calculatedTerminationDate.toDate();
}
