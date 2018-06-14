import monk from 'monk';
import nconf from 'nconf';
import stripePayments from '../../website/server/libs/payments/stripe';

/*
 * Ensure that group plan billing is accurate by doing the following:
 * 1. Correct the memberCount in all paid groups whose counts are wrong
 * 2. Update the above's subscription counts in Stripe via their API
 */

const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');

let dbGroups = monk(CONNECTION_STRING).get('groups', { castIds: false });
let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function fixGroupPlanMembers () {
  let groupPlanCount = 0;
  let fixedGroupCount = 0;
  dbGroups.find(
    {
      $and:
        [
          {'purchased.plan.planId': {$ne: null}},
          {'purchased.plan.planId': {$ne: ''}},
        ],
      $or:
        [
          {'purchased.plan.dateTerminated': null},
          {'purchased.plan.dateTerminated': ''},
          {'purchased.plan.dateTerminated': {$gt: new Date()}},
        ]
    },
    {
      fields: {
        'memberCount': 1,
        'purchased.plan': 1,
      },
    }
  ).each((group, {close, pause, resume}) => {
    groupPlanCount++;
    const canonicalMemberCount = dbUsers.count(
      {
        $or:
          [
            {'party._id': group._id},
            {'guilds': group._id},
          ]
      }
    );
    if (group.memberCount !== canonicalMemberCount) {
      pause();
      return dbGroups.update(
        {_id: group._id},
        {$set: {memberCount: canonicalMemberCount}}
      ).then(async () => {
        if (group.purchased.plan.paymentMethod === 'Stripe') {
          await stripePayments.chargeForAdditionalGroupMember(group);
        }
        fixedGroupCount++;
        resume();
      });
    }
  }).then(() => {
    console.info(`Fixed ${fixedGroupCount} out of ${groupPlanCount} active Group Plans`);
    return process.exit(0);
  });
}

module.exports = fixGroupPlanMembers;
