module ApplicationHelper
  
  def score
    current_user.habits.sum('score').to_i
  end
end
