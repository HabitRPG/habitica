// this achievement covers all pets of a specific type--classic & quest
import { dropPets, questPets } from '../stable';

const PET_SET_COMPLETE_ACHIEVEMENTS = [
  {
    boneToPick: {
      type: 'pet',
      color: 'Skeleton',
      egg: dropPets && questPets,
      petAchievement: 'boneToPick',
      petNotificationType: 'ACHIEVEMENT_PET_SET_COMPLETE',
      // need to do some sort of loop here (or outside the constant)
    },
  },
];

export default PET_SET_COMPLETE_ACHIEVEMENTS;
