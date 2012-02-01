class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  
  belongs_to :user
  
  def next_vote
    1 #TODO return log or linear based on current score
  end
end
