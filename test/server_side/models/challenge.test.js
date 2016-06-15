import { model as Challenge } from '../../../website/server/models/challenge';

describe('payments/index', () => {

  describe('#verifyChallenge', () => {

    it( 'tests', () =>{
    	console.log( 'startedTest');
    	var challenge = new Challenge({'shortName': 'hi'});
    	console.log( challenge);
    	challenge.testExtra = 'travis';
    	console.log( challenge );
    	var errors = challenge.validateSync();
    	console.log( errors );
    	console.log( 'endedTest' );
    });

    // it('succeeds', async () => {
    //   data = { user, sub: { key: 'basic_3mo' } };
    //   expect(user.purchased.plan.planId).to.not.exist;
    //   await api.createSubscription(data);
    //   expect(user.purchased.plan.planId).to.exist;
    // });

    // it('sets subscription length', async () => {
    //   data = { user, sub: { key: 'basic_3mo' }, paymentMethod: 'Amazon Payments' };
    //   await api.createSubscription(data);
    //   expect(user.purchased.plan.subscriptionLengthMonths).to.be.eql(3);
    // });

    // it('awards mystery items', async () => {
    //   data = { user, sub: { key: 'basic_3mo' } };
    //   await api.createSubscription(data);
    //   expect(user.purchased.plan.mysteryItems.length).to.eql(MYSTERY_AWARD_COUNT);
    // });
  });
});
