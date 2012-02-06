class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  
  belongs_to :user
  default_scope :order => 'position ASC'
  acts_as_list
  
  # TODO set cron for this
  def self.clear_done
    Habit.where(:habit_type => Habit::DAILY).collect do |h|
      h.vote('down', true) unless h.done
      h.done = false
      h.save
    end
  end
  
  def vote(direction, clear=false)
    # For negative values, use a line: something like y=-.1x+1
    # For positibe values, taper off with inverse log: y=.9^x
    # Would love to use inverse log for the whole thing, but after 13 fails it hits infinity
    sign = ( direction=='up' ? 1 : -1 )
    value = 0
    if self.score < 0
      value = ( ( -0.1 * self.score + 1 ) * sign )
    else
      value = ( ( 0.9 ** self.score ) * sign )
    end

    self.score += value
    
    # also add money. Only take away money if it was a mistake (aka, a checkbox)
    if (direction=='up') || (direction=='down' && clear==false && self.habit_type!=Habit::ALWAYS)
      self.user.money += value
      self.user.save
    end
    
    # up/down -voting as checkbox & assigning as done, 2 birds one stone
    if(self.habit_type==Habit::DAILY || self.habit_type==Habit::ONE_TIME)
      self.done = true if direction=='up'
      self.done = false if direction=='down'
    end
    
    save
  end
end
