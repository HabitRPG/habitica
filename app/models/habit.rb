class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  
  belongs_to :user
  
  # TODO set cron for this
  def self.clear_done
    Habit.where(:habit_type => Habit::DAILY).collect do |h|
      h.vote('down') unless h.done
      h.done = false
      h.save
    end
  end
  
  def vote(direction)
    next_vote = 1 #TODO return log or linear based on current score
    next_vote *= -1 if(direction=='down')
    self.score += next_vote
    self.votedate = Time.now
    if(self.habit_type==Habit::DAILY)
      self.done = true if direction=='up'
      self.done = false if direction=='down'
    end
  end
end
