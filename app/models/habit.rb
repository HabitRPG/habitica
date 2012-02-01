class Habit < ActiveRecord::Base
  ALWAYS = 1
  DAILY = 2
  ONE_TIME = 3
  
  belongs_to :user
  
  def vote(direction)
    next_vote = 1 #TODO return log or linear based on current score
    next_vote *= -1 if(direction=='down')
    self.score += next_vote
    self.votedate = Time.now
    #TODO if type=daily & votedate=today, set done back to false (have a done column?)
  end
end
