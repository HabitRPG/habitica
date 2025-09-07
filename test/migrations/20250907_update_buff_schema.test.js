/* eslint-disable camelcase */
import { model as User } from '../../../website/server/models/user';
import processUsers from '../../../migrations/20250907_update_buff_schema';
import {
  generateUser,
} from '../../helpers/api-unit.helper.js';
import { each } from 'lodash';

describe('Migration: add startDate to buffs', () => {
  let user;
  const stats = {
    buffs: {
      str: 5,
      int: 4, 
      per: 3,
      con: 2,
      stealth: 1,
      streaks: true,
      snowball: true,
      spookySparkles: true,
      shinySeed: true,
      seafoam: true
    }
  };

  beforeEach(async () => {
    user = await generateUser();
    await User.updateOne({ _id: user._id }, {
      $set: { stats }
    }).exec();

    await processUsers();
  });

  it('adds startDate for active buffs', async () => {
    const updatedUser = await User.findById(user._id).exec();
    const now = new Date();
    
    each(['str', 'int', 'per', 'con', 'stealth'], (buff) => {
      const startDate = updatedUser.stats.buffs[`${buff}StartDate`];
      expect(startDate).to.be.a('Date');
      expect(startDate.getTime()).to.be.at.most(now.getTime());
      expect(startDate.getTime()).to.be.at.least(now.getTime() - 10000); // within 10 seconds
    });

    each(['streaks', 'snowball', 'spookySparkles', 'shinySeed', 'seafoam'], (buff) => {
      const startDate = updatedUser.stats.buffs[`${buff}StartDate`];
      expect(startDate).to.be.a('Date'); 
      expect(startDate.getTime()).to.be.at.most(now.getTime());
      expect(startDate.getTime()).to.be.at.least(now.getTime() - 10000);
    });
  });

  it('does not add startDate for non-active buffs', async () => {
    await User.updateOne({ _id: user._id }, {
      $set: { 
        'stats.buffs': {
          str: 0,
          int: 0,
          per: 0,
          con: 0,
          stealth: 0,
          streaks: false, 
          snowball: false,
          spookySparkles: false,
          shinySeed: false,
          seafoam: false
        }
      }
    }).exec();

    await processUsers();

    const updatedUser = await User.findById(user._id).exec();
    
    each(['str', 'int', 'per', 'con', 'stealth'], (buff) => {
      expect(updatedUser.stats.buffs[`${buff}StartDate`]).to.not.exist;
    });
    
    each(['streaks', 'snowball', 'spookySparkles', 'shinySeed', 'seafoam'], (buff) => {
      expect(updatedUser.stats.buffs[`${buff}StartDate`]).to.not.exist;
    });
  });
});
