// this achievement covers all pets of a specific type--classic & quest
import all from '../eggs';

const PET_COMPLETE_ACHIEVEMENTS = [
  {
    boneToPick: {
      type: 'pet',
      color: 'Skeleton',
      petAchievement: 'boneToPick',
      petNotificationType: 'ACHIEVEMENT_PET_COLOR COMPLETE',
      species: all,
    },
  },
];

export default PET_COMPLETE_ACHIEVEMENTS;
