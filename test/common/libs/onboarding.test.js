import moment from 'moment';
import {
  hasCompletedOnboarding,
  onOnboardingComplete,
  checkOnboardingStatus,
} from '../../../website/common/script/libs/onboarding';
import { generateUser } from '../../helpers/common.helper';

describe('onboarding', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.addNotification = sinon.spy();
    // Make sure the onboarding is active
    user.auth.timestamps.created = moment('2019-12-20').toDate();
  });

  describe('hasCompletedOnboarding', () => {
    it('returns false if no achievement has been awarded', () => {
      const result = hasCompletedOnboarding(user);
      expect(result).to.eql(false);
    });

    it('returns false if not all achievements have been awarded', () => {
      user.achievements.completedTask = true;
      const result = hasCompletedOnboarding(user);
      expect(result).to.eql(false);
    });

    it('returns true if all achievements have been awarded', () => {
      user.achievements.createdTask = true;
      user.achievements.completedTask = true;
      user.achievements.hatchedPet = true;
      user.achievements.fedPet = true;
      user.achievements.purchasedEquipment = true;

      const result = hasCompletedOnboarding(user);
      expect(result).to.eql(true);
    });
  });

  describe('onOnboardingComplete', () => {
    it('awards prizes', () => {
      const { gp } = user.stats;
      onOnboardingComplete(user);
      expect(user.stats.gp).to.eql(gp + 100);
    });
  });

  describe('checkOnboardingStatus', () => {
    it('does nothing if onboarding is not active', () => {
      const { gp } = user.stats;
      user.auth.timestamps.created = moment('2019-12-01').toDate();

      checkOnboardingStatus(user);
      expect(user.addNotification).to.not.be.called;

      expect(user.stats.gp).to.eql(gp);
    });

    it('does nothing if onboarding is not complete', () => {
      const { gp } = user.stats;

      checkOnboardingStatus(user);
      expect(user.addNotification).to.not.be.called;

      expect(user.stats.gp).to.eql(gp);
    });

    it('awards prize and add notification when onboarding is complete', () => {
      user.achievements.createdTask = true;
      user.achievements.completedTask = true;
      user.achievements.hatchedPet = true;
      user.achievements.fedPet = true;
      user.achievements.purchasedEquipment = true;
      const { gp } = user.stats;

      checkOnboardingStatus(user);
      expect(user.addNotification).to.be.calledOnce;
      expect(user.addNotification).to.be.calledWith('ONBOARDING_COMPLETE');

      expect(user.stats.gp).to.eql(gp + 100);
    });
  });
});
