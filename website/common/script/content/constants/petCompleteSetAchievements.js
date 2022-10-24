// this achievement covers all pets of a specific type--classic & quest
import all from '../eggs';

const PET_SET_COMPLETE_ACHIEVEMENTS = [
  {
    boneToPick: {
      type: 'pet',
      color: 'Skeleton',
      petAchievement: 'boneToPick',
      petNotificationType: 'ACHIEVEMENT_PET_SET_COMPLETE',
      species: all, // need to do some sort of loop de loop here (or outside the constant)
    },
  },
];

export default PET_SET_COMPLETE_ACHIEVEMENTS;
