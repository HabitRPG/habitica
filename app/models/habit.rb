class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  REWARD = 4
  
  belongs_to :user
  default_scope :order => 'position ASC'
  acts_as_list
  
  # TODO set cron for this
  def self.clear_done
    Habit.where(:habit_type => Habit::DAILY).collect do |h|
      unless h.done
        value = 0
        if h.score < 0
          value = ( ( -0.1 * h.score + 1 ) * -1 )
        else
          value = ( ( 0.9 ** h.score ) * -1 )
        end
        h.score += value
        h.user.exp += value
        h.user.save
      end
      h.done = false
      h.save
    end
  end
  
end