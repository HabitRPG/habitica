class ChangeHabitsScoreToFloat < ActiveRecord::Migration
  def up
    change_column :habits, :score, :float
  end

  def down
    change_column :habits, :score, :integer
  end
end
