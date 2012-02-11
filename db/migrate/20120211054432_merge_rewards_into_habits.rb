class MergeRewardsIntoHabits < ActiveRecord::Migration
  def up
    Reward.all.each do |reward|
      Habit.create!({
        :user_id=>reward.user_id,
        :name=>reward.name, 
        :score=>reward.value, 
        :habit_type=>4, 
        :up=>false,
        :position=>Habit.maximum('position')+1
        })
    end
    drop_table :rewards
  end

  def down
    create_table :rewards do |t|
      t.string :name
      t.integer :value, :default=>20
      t.integer :position, :default=>0
      t.references :user
      t.timestamps
    end
    
    Habit.where(:habit_type=>4).each do |reward|
      Reward.create!({
        :user_id=>reward.user_id,
        :name=>reward.name, 
        :value=>reward.score, 
        :position=>Habit.maximum('position')+1
      })
      
    end
  end
end