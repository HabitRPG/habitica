import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies
import nconf from 'nconf';
import stripePayments from '../../website/server/libs/payments/stripe';

/*
 * Ensure that group plan billing is accurate by doing the following:
 * 1. Correct the memberCount in all paid groups whose counts are wrong
 * 2. Where the above uses Stripe, update their subscription counts in Stripe
 *
 * Provides output on what groups were fixed, which can be piped to CSV.
 */

const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');

const dbGroups = monk(CONNECTION_STRING).get('groups', { castIds: false });
const dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

async function fixGroupPlanMembers () {
  console.info('Group ID, Customer ID, Plan ID, Quantity, Recorded Member Count, Actual Member Count');
  let groupPlanCount = 0;
  let fixedGroupCount = 0;

  dbGroups.find(
    {
      $and:
        [
          { 'purchased.plan.planId': { $ne: null } },
          { 'purchased.plan.planId': { $ne: '' } },
          { 'purchased.plan.customerId': { $ne: 'cus_9f0DV4g7WHRzpM' } }, // Demo groups
          { 'purchased.plan.customerId': { $ne: 'cus_9maalqDOFTrvqx' } },
        ],
      $or:
        [
          { 'purchased.plan.dateTerminated': null },
          { 'purchased.plan.dateTerminated': '' },
        ],
    },
    {
      fields: {
        memberCount: 1,
        'purchased.plan': 1,
      },
    },
  ).each(async (group, { close, pause, resume }) => { // eslint-disable-line no-unused-vars
    pause();
    groupPlanCount += 1;

    const canonicalMemberCount = await dbUsers.countDocuments(
      {
        $or:
          [
            { 'party._id': group._id },
            { guilds: group._id },
          ],
      },
    );
    const incorrectMemberCount = group.memberCount !== canonicalMemberCount;

    const isMonthlyPlan = group.purchased.plan.planId === 'group_monthly';
    const quantityMismatch = group.purchased.plan.quantity !== group.memberCount + 2;
    const incorrectQuantity = isMonthlyPlan && quantityMismatch;

    if (!incorrectMemberCount && !incorrectQuantity) {
      resume();
      return;
    }

    console.info(`${group._id}, ${group.purchased.plan.customerId}, ${group.purchased.plan.planId}, ${group.purchased.plan.quantity}, ${group.memberCount}, ${canonicalMemberCount}`);

    const groupUpdate = await dbGroups.update(
      { _id: group._id },
      {
        $set: {
          memberCount: canonicalMemberCount,
        },
      },
    );

    if (!groupUpdate) return;

    fixedGroupCount += 1;
    if (group.purchased.plan.paymentMethod === 'Stripe') {
      await stripePayments.chargeForAdditionalGroupMember(group);
      await dbGroups.update(
        { _id: group._id },
        { $set: { 'purchased.plan.quantity': canonicalMemberCount + 2 } },
      );
    }

    if (incorrectQuantity) {
      await dbGroups.update(
        { _id: group._id },
        { $set: { 'purchased.plan.quantity': canonicalMemberCount + 2 } },
      );
    }

    resume();
  }).then(() => {
    console.info(`Fixed ${fixedGroupCount} out of ${groupPlanCount} active Group Plans`);
    return process.exit(0);
  }).catch(err => {
    console.log(err);
    return process.exit(1);
  });
}

export default fixGroupPlanMembers;
