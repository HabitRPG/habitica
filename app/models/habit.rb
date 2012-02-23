class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  REWARD = 4
  
  belongs_to :user
  default_scope :order => 'position ASC'
  attr_accessible :name, :habit_type, :score, :notes, :up, :down, :done, :position
    
  # Note: Set 12am daily cron for this
  # At end of day, add value to all incomplete Daily & Todo tasks (further incentive)
  # For incomplete Dailys, deduct experience  
  def self.clear_done
    Habit.where('habit_type in (2,3)').collect do |h|
      unless h.done
        value = (h.score < 0) ? (( -0.1 * h.score + 1 ) * -1) : (( 0.9 ** h.score ) * -1)
        # Deduct experience for missed Daily tasks, 
        # but not for Todos (just increase todo's value)
        if(h.habit_type==2)
          h.user.exp += value
          h.user.money += value
          h.user.save
        end
        h.score += value
      end
      h.done = false if (h.habit_type==2)
      h.save
    end
  end
  
end
