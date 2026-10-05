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

  const nextBillMoment = nextBill ? moment(nextBill) : null;

  const remaining = nextBillMoment
    ? nextBillMoment.diff(new Date(), 'days', true)
    : defaultRemainingDays;

  const extraMonths = Math.max(purchasedPlan.extraMonths, 0);
  const extraDays = Math.ceil(30.5 * extraMonths);

  const calculatedTerminationDate = moment().startOf('day').add({
    days: remaining + extraDays,
    hours: nextBillMoment ? nextBillMoment.hour() : 0,
    minutes: nextBillMoment ? nextBillMoment.minute() : 0,
    seconds: nextBillMoment ? nextBillMoment.second() : 0,
  });

  // If a termination date is already set, use the one further in the future
  if (purchasedPlan.dateTerminated) {
    return calculatedTerminationDate.isBefore(purchasedPlan.dateTerminated)
      ? purchasedPlan.dateTerminated : calculatedTerminationDate.toDate();
  }

  // Otherwise the calculated one
  return calculatedTerminationDate.toDate();
}
