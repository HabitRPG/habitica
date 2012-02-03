module HabitsHelper
  
  def score_color(habit)
    s = habit.score
    case
      when s<-5 then return 'bad'
      when s>=-5 && s<0 then return 'iffy' 
      when s>=0 && s<5 then return 'ok' 
      when s>=5 && s<15 then return 'good' 
      when s>=15 then return 'done' 
     end
  end
  
  def vote_link(habit, state)
    case state
      when 'up' 
        return unless habit.up
        text,dir,style = "+","up","up"
      when 'down'
        return unless habit.down
        text,dir,style = "-","down","down"
      when 'checked'  then text,dir,style = "[ ]","up","check"
      when 'unchecked' then text,dir,style = "[X]","down","check"
    end
    return link_to(text, { :action => "vote", :id => habit.id, :vote => 'dir' }, :class=>style, :remote=>true)
  end
  
end
