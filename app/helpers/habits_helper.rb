module HabitsHelper
  
  def habit_type(habit)
    case habit.habit_type
      when 1 then return "habit"
      when 2 then return "daily"
      when 3 then return "one-time"
    end
  end
    
  def score_color(habit)
    s = habit.score
    case
      when s<-8 then return 'color-red'
      when s>=-8 && s<-5 then return 'color-pink'
      when s>=-5 && s<-1 then return 'color-orange' 
      when s>=-1 && s<1 then return 'color-yellow'
      when s>=1 && s<5 then return 'color-green' 
      when s>=5 && s<10 then return 'color-light-blue' 
      when s>=10 then return 'color-blue' 
     end
  end
  
  def vote_link(habit, direction=nil)
    if direction=='up'
      return unless habit.up
      text,dir,style = "+","up","up"
    elsif direction=='down'
      return unless habit.down
      text,dir,style = "-","down","down"
    elsif habit.done
      text,dir,style = "[X]","down","check"
    else
      text,dir,style = "[ ]","up","check" 
    end
    return link_to(text, { :action => "vote", :id => habit.id, :vote => dir }, :class=>style+" vote-link", :remote=>true)
  end
  
  def user_gold
    current_user.money.to_i
  end
  
  def user_silver
    number_with_precision(current_user.money, :precision=>1).split('.')[1]
  end
  
end
