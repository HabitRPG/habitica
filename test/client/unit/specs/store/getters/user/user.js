import { data, gems, buffs, preferences, tasksOrder } from 'client/store/getters/user';
import Store from 'client/store';

describe('user getters', () => {

  describe('data', () => {
    it('returns the user\'s data', () => {
      
      expect(data({
       state: {
         user: {
           data: { 
	     lvl: 1 
	   },
	 },
       }
      }).lvl).to.equal(1);
    });
  });

  describe('gems', () => {
    it('returns the user\'s gems', () => {
      expect(gems({
        state: {
          user: {
            data: {balance:4.5},
          },
        },
      })).to.equal( 18 );
    });
  });

  describe('buffs', () => {
  
    it('returns the user\'s buffs', () => {
       
    
      expect(buffs({
        state: {
          user: {
            data: {
	      stats: {
	        buffs: [1] 
	      },
            },
          },
        }
      })(0)).to.equal(1);
      
    });
  });

  describe('preferences', () => {
    it('returns the user\'s preferences', () => {
      expect(preferences({
        state: {
          user: {
            data: {
	      preferences: 1,
            },
          },
        }
      })).to.equal(1);
      //expect(preferences()).to.not.equal('undefined');
    });
  });

  xdescribe('tasksOrder', () => {
    it('returns the user\'s tasksOrder', () => {
      expect(tasksOrder()).to.not.equal('null');
      expect(tasksOrder()).to.not.equal('undefined');
    });
  });

});